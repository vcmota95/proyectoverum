import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

// Gera o token de autenticação para a API V1 do Firebase
async function getFirebaseAccessToken(): Promise<string> {
    const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!);

    const now = getNumericDate(0);
    const exp = getNumericDate(60 * 60); // expira em 1 hora

    const payload = {
        iss: serviceAccount.client_email,
        sub: serviceAccount.client_email,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: exp,
        scope: "https://www.googleapis.com/auth/firebase.messaging",
    };

    // Importa a chave privada do JSON
    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        pemToArrayBuffer(serviceAccount.private_key),
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const jwt = await create({ alg: "RS256", typ: "JWT" }, payload, privateKey);

    // Troca o JWT por um access token do Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
}

// Converte a chave PEM do JSON para o formato que o crypto precisa
function pemToArrayBuffer(pem: string): ArrayBuffer {
    const base64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/, "")
        .replace(/-----END PRIVATE KEY-----/, "")
        .replace(/\n/g, "");
    const binary = atob(base64);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
        view[i] = binary.charCodeAt(i);
    }
    return buffer;
}

serve(async (req) => {
    try {
        const payload = await req.json();
        const post = payload.record;

        // Só dispara se o post foi confirmado
        if (post.status !== "confirmed") {
            return new Response(
                JSON.stringify({ message: "Post não confirmado, ignorando." }),
                { status: 200 }
            );
        }

        // Conecta ao Supabase
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Busca alunos inscritos na matéria com token salvo
        const { data: profiles } = await supabase
            .from("profiles")
            .select("fcm_token")
            .contains("enrolled_subjects", [post.subject_id])
            .not("fcm_token", "is", null);

        if (!profiles || profiles.length === 0) {
            return new Response(
                JSON.stringify({ message: "Nenhum usuário para notificar." }),
                { status: 200 }
            );
        }

        const tokens = profiles.map((p: { fcm_token: string }) => p.fcm_token);

        // Pega o project_id do Firebase
        const serviceAccount = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!);
        const projectId = serviceAccount.project_id;

        // Gera o token de acesso
        const accessToken = await getFirebaseAccessToken();

        const notificationBody = post.event_date
            ? `Data: ${new Date(post.event_date).toLocaleDateString("pt-BR")} — ${post.description}`
            : post.description;

        // Envia para cada celular
        let successCount = 0;
        for (const token of tokens) {
            const response = await fetch(
                `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        message: {
                            token: token,
                            notification: {
                                title: `✅ Confirmado: ${post.title}`,
                                body: notificationBody,
                            },
                            data: {
                                post_id: post.id,
                                subject_id: post.subject_id,
                            },
                        },
                    }),
                }
            );

            if (response.ok) successCount++;
        }

        return new Response(
            JSON.stringify({ message: `Notificações enviadas: ${successCount}/${tokens.length}` }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro:", error);
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
});