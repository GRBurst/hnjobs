import OpenAI from 'openai';
import sanitizeHtml from "sanitize-html"

const restructureText = async (data: str): Promise<void> => {

    const client = new OpenAI();
    const cleanData = sanitizeHtml(data, {
        allowedTags: [],
        allowedAttributes: {}
    })
    return

}


