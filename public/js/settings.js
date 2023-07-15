function updateNotificationSetting(element){
    console.log(element.id);
    console.log(element.checked);
    let payload = {
        settingName: element.id,
        settingValue: element.checked
    };

    $.ajax({
        url: `/settings`,
        method: "POST",
        xhrFields: {
            withCredentials: true
        },
        data: jQuery.param(payload),
        fail: function () {
            let element = document.getElementById(element.id);
            alert("Failed to update " + element + ". Please retry later");
        }
    });
}