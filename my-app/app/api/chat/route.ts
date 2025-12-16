import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST() {
    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            temperature: 0.7,
            top_p: 0.9,
            max_completion_tokens: 1024,
            messages: [{ role: "user", content: "Say hello" }],
        });

        return new Response(
            completion.choices[0].message.content,
            { headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
    } catch (err: any) {
        console.error(err);
        return new Response(
            err.message,
            { status: 500 }
        );
    }
}
