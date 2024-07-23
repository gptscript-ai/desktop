export async function POST(_req: Request) {
    return new Response(process.env.GPTSCRIPT_PORT ?? "3000");
}
