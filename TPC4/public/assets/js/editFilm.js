document.addEventListener("DOMContentLoaded", () => {
    const formLists = document.getElementsByClassName("formItemList");
    for (const f of formLists) {
        enhanceFormItemList(f)
    }

    const errorLabel = document.getElementById("errorLabel");
    /** @type {HTMLFormElement} */
    const form = document.getElementById("editForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorLabel.textContent = "";
        errorLabel.style.display = "none";

        const formData = new FormData(form);
        const nFormData = new URLSearchParams();

        const formLists = form.getElementsByClassName("formItemList");

        nFormData.append("id", formData.get("id"));
        nFormData.append("title", formData.get("title"));
        nFormData.append("year", formData.get("year"));
        nFormData.append("cast", JSON.stringify(getFormItemListData(formLists[0])));
        nFormData.append("genres", JSON.stringify(getFormItemListData(formLists[1])));

        try {
            const res = await fetch(form.action, {
                method: "POST",
                body: nFormData,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });

            if (res.redirected) {
                window.location.replace(`${res.url}${document.location.search}`);
                return;
            }

            const body = await res.json();

            if (!res.ok || body.error) {
                errorLabel.textContent = body.message;
                errorLabel.style.display = "block";
            }
        } catch (e) {
            errorLabel.textContent = "Unknown error."
            errorLabel.style.display = "block";
        }
    })
});

function _eFIL_Delete(e) {
    e.preventDefault();
    e.target.removeEventListener("click", _eFIL_Delete);

    e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
}
function enhanceFormItemList(elem) {
    const input = elem.querySelector("[name='_formListInput']")
    const list = elem.querySelector("ul");

    input.addEventListener("keypress", (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();

        const li = document.createElement("li");
        li.setAttribute("name", "_formListElement");
        li.className = "flex fc fsb";

        const textDiv = document.createElement("div");
        textDiv.textContent = e.target.value;
        
        const ctrlContainer = document.createElement("div");
        ctrlContainer.className = "flex fc fh";

        const delBtn = document.createElement("button");
        delBtn.className = "w3-cell w3-button";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", _eFIL_Delete);
        ctrlContainer.appendChild(delBtn);

        li.appendChild(textDiv);
        li.appendChild(ctrlContainer);
        list.appendChild(li);

        e.target.value = "";
    });
    
    const delBtns = list.querySelectorAll("[name='_formListElement'] button");
    delBtns.forEach(btn => btn.addEventListener("click", _eFIL_Delete));
}

function getFormItemListData(elem) {
    const list = elem.querySelector("ul");
    const dataElems = Array.from(list.querySelectorAll("li > div:first-child"));
    const data = dataElems.map(e => e.textContent);

    return data;
}
