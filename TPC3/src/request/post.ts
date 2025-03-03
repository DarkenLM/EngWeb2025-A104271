async function postRequest(url: string, body, debug) {
    const headers = new Headers();
    headers.append("Content-Type", "application/json; charset=utf-8");
    
    const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),

        headers: headers
    });

    const resData = debug ? await res.text() : await res.json();
    return resData;
}

export default postRequest;