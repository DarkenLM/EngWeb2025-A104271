async function getRequest(url: string) {
    const res = await fetch(url, {
        method: "GET"
    });

    const resData = await res.json();
    return resData;
}

export default getRequest;