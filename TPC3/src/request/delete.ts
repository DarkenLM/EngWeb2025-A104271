async function deleteRequest(url: string) {
    const res = await fetch(url, {
        method: "DELETE"
    });

    const resData = await res.json();
    return resData;
}

export default deleteRequest;