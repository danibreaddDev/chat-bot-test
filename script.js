//chat sin llamada a api ni backend ni nada https://github.com/mlc-ai/web-llm
//importarlo y elegir el modelo a traves del modelId
//mejora faltaria hacer un worker para separar del hilo principal la carga de los mensajes del bot. 

import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

//elemento del dom
const $ = el => document.querySelector(el);
const $form = $("form");
const $input = $("input");
const $template = $("#message-template");
const $mensajes = $("ul");
const $contenedor = $("main");
const $boton = $("button");
const $delay = 5000;
const $info = $("small");
const SELECTED_MODEL = "Llama-3-8B-Instruct-q4f32_1-MLC-1k";
const engine = await CreateMLCEngine(
    SELECTED_MODEL,
    {
        initProgressCallback: (info) => {
            console.log("initProgressCallback", info);
            $info.textContent = `${info.text}%`;
            if (info.progress === 1) {
                $boton.removeAttribute("disabled");
            }
        },
    }
);

$form.addEventListener("submit", async event => {
    event.preventDefault();
    let messages = [];
    const messageText = $input.value.trim();
    if (messageText !== "") {
        $input.value = "";
    }
    addMessage(messageText, "user");
    $boton.setAttribute("disabled", true);
    const userMessage = {
        role: "user",
        content: messageText
    }
    messages.push(userMessage);

    const chunks = await engine.chat.completions.create({
        messages,
        stream: true
    })
    let reply = "";
    const $botText = addMessage("", "bot");
    for await (const chunk of chunks) {
        const choice = chunk.choices[0];
        const content = choice?.delta?.content ?? "";
        reply += content;
        $botText.textContent = reply;
    }

    messages.push({
        role: "assistant",
        content: reply
    });
    $boton.removeAttribute("disabled");
});
function addMessage(text, sender) {
    const clon = $template.content.cloneNode(true);
    const $newMessage = clon.querySelector(".message");
    const $who = $newMessage.querySelector("span");
    const $text = $newMessage.querySelector("p");
    $text.textContent = text;
    $who.textContent = sender === "bot" ? "BOT" : "TU";
    $newMessage.classList.add(sender);
    $mensajes.appendChild($newMessage);
    $contenedor.scrollTop = $contenedor.scrollHeight; //posicion scroll a la altura del total
    return $text;
}