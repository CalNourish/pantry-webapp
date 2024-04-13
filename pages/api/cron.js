import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(request, response) {
    const result = await fetch(
        'https://fetch-upload-data-3v6ppefuxq-uc.a.run.app',
    );
    const data = await result.json();

    return response.json({ datetime: data.datetime });
}