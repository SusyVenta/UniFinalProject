window.addEventListener("DOMContentLoaded", () => {
    $("#profile").on("click", () => {
        // if vendor redirect to vendor_profile
        //if customer redirect to user_profile
        if (is_vendor) {
            window.location.href =
                "//" +
                window.location.host +
                "/vendor_profile";
        } else if (!is_vendor) {
            window.location.href =
                window.location.protocol +
                "//" +
                window.location.host +
                "/users/" +
                uid +
                "/profile";
        }
    });
});
