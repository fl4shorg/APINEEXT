// arquivos/TextPro.js
const express = require('express');
const cheerio = require('cheerio');
const cookie = require('cookie');
const fetch = require('node-fetch');
const FormData = require('form-data');

const router = express.Router();
const FIXED_COOKIE = "PHPSESSID=dhl6jce6sehkf2nniogei5fcb2; __gads=ID=5b4843e6a7347e69:T=1723742092:RT=1724139071:S=ALNI_MY_Aw7lonCiv1TAknXGwojUnRfS5A; __gpi=UID=00000ebfad8dc4a6:T=1723742092:RT=1724139071:S=ALNI_MZcW1-oCkFI-FZQnBVLesP3qyRJUA; __eoi=ID=9617765c6bf91c5f:T=1723742092:RT=1724139071:S=AA-Afjalp7nqEbonITTKkl8oPi3F; _ga=GA1.1.21528983.1723742050; _ga_7FPT6S72YE=GS1.1.1724138986.2.1.1724139133.0.0.0; FCNEC=%5B%5B%22AKsRol9TbDPZGZfYcAZaTI6jGucM2znpb3DnAHR5IUTS9hEUROEMJ93jTcQw7oj2rhnslz-HdW2HGYvIRvOHitWxsWw2ysFVncxSx_7wD9tDdiKqk3HEyKmnuejd99plqelofDiSrwOVTirVcQdXMHKx6EAadg-4sA%3D%3D%22%5D%5D";

async function post(url, formdata = {}, cookieHeader = FIXED_COOKIE) {
    const encode = encodeURIComponent;
    const body = Object.keys(formdata)
        .map(key => {
            let vals = Array.isArray(formdata[key]) ? formdata[key] : [formdata[key]];
            return vals.map(val => `${encode(key)}=${encode(val)}`).join("&");
        })
        .join("&");

    return fetch(`${url}?${body}`, {
        method: "GET",
        headers: {
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": "GoogleBot",
            Cookie: cookieHeader
        }
    });
}

async function textproEffect(url, text) {
    if (!/^https:\/\/textpro\.me\/.+\.html$/.test(url)) throw new Error("URL inválida!");

    const geturl = await fetch(url, { method: "GET", headers: { "User-Agent": "GoogleBot", Cookie: FIXED_COOKIE } });
    const html = await geturl.text();

    const $ = cheerio.load(html);
    const token = $('input[name="token"]').attr("value");
    if (!token) throw new Error("Token não encontrado!");

    const form = new FormData();
    if (typeof text === "string") text = [text];
    text.forEach(t => form.append("text[]", t));
    form.append("submit", "Go");
    form.append("token", token);
    form.append("build_server", "https://textpro.me");
    form.append("build_server_id", 1);

    const geturl2 = await fetch(url, {
        method: "POST",
        headers: { Accept: "*/*", "User-Agent": "GoogleBot", Cookie: FIXED_COOKIE, ...form.getHeaders() },
        body: form.getBuffer()
    });

    const html2 = await geturl2.text();
    const token2 = /<div.*?id="form_value".+>(.*?)<\/div>/.exec(html2);
    if (!token2) throw new Error("Token de processamento não encontrado!");

    const resultResponse = await post("https://textpro.me/effect/create-image", JSON.parse(token2[1]), FIXED_COOKIE);
    const result = await resultResponse.json();

    return `https://textpro.me${result.fullsize_image}`;
}

// Rota GET pronta para app.use
router.get('/', async (req, res) => {
    const { url, text } = req.query;
    if (!url || !text) return res.json({ success: false, message: "Faltando url ou text" });

    try {
        const imageUrl = await textproEffect(url, text);
        res.json({ success: true, image: imageUrl });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

module.exports = router;