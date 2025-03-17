document.addEventListener("DOMContentLoaded", () => {
    const deleteBtns = document.getElementsByName("deleteBtn");
    for (const btn of deleteBtns) {
        btn.addEventListener("click", async (e) => {
            try {
                const id = e.target.getAttribute("data-target");
                const res = await fetch(new URL(`delete/${id}`, window.location.href), {
                    method: "GET"
                });
    
                if (!res.ok) return;

                const elem = document.querySelector(`tr[data-id=${id}]`);
                if (elem) {
                    elem.parentElement.removeChild(elem);
                }
            } catch (e) {
                // Just ignore it.
                console.error(e)
            }
        })
    }
});