function alterEditUsername(){
    // if the input field is disabled, enables it and changes icon to save
    // when user clicks on save, disable input and change icon to edit
    let inputElement = document.getElementById("username-input");
    if (inputElement.disabled) {
        $(inputElement).removeAttr('disabled');

        let icon = document.getElementById("edit-username-button-icon");
        icon.innerHTML = "save";
    } else {
        // save action triggered
        inputElement.disabled = true;

        let icon = document.getElementById("edit-username-button-icon");
        icon.innerHTML = "edit";

        let uid = (window.location.href).split("/").at(-1);

        let payload = {username: inputElement.value};
        // save modifications
        $.ajax({
            url: `/profile/${uid}`,
            method: "POST",
            xhrFields: {
              withCredentials: true
            },
            data: jQuery.param(payload),
            fail: function(xhr, textStatus, errorThrown){ 
                alert("somethign went wrong whlie saving your information. Error: " + textStatus);
            }
        });
    }
}