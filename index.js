const HOVER_PICTURES = [
    "profile",
    "mexico",
    "kyudo"
];

const SKILL_BAR_PROGRESS = {
    "python-bar": "100%",
    "html-bar": "70%",
    "css-bar": "60%",
    "js-bar": "80%",
    "java-bar": "90%",
    "c-sharp-bar": "80%",
    "bootstrap-bar": "70%",
    "jquery-bar": "70%",
    "d3-bar": "85%"
};

const LISTENER_IDS = [
    "japanese",
    "education",
    "technical-skills",
    "map",
    "professor",
    "skandinaviska",
    "pitchfork"
];

const INSTRUMENT_BAR_PROGRESS = {
    "bass": "90%",
    "guitar": "70%",
    "piano": "60%",
    "ukulele": "60%"
}

const MOBILE_WINDOW_SIZE_THRESHOLD = 992;

var PageState = {
    HOVER: 1,
    CLICK: 2
};

var Animation = {
    FILL: 1,
    RESET: 2
};

var Language = {
    ENGLISH: 1,
    JAPANESE: 2
};

var ActiveElement = {
    LANDING: 1,
    SKILLS: 2,
    MAP: 3,
    EDUCATION: 4,
    LANGUAGES: 5,
    PROFESSOR: 6,
    SKANDINAVISKA: 7,
    PITCHFORK: 8
}

var WindowSize = {
    MOBILE: 1,
    OTHER: 0
}

var currentLanguage = Language.ENGLISH;
var pageState = PageState.HOVER;
var activeElement = ActiveElement.LANDING;
var currentWindowSize = document.documentElement.clientWidth > MOBILE_WINDOW_SIZE_THRESHOLD ? WindowSize.OTHER : WindowSize.MOBILE;

function addPictureHoverListener(hoverPictureID, index) {
    $("#" + hoverPictureID).hover(() => {
        if (pageState === PageState.CLICK) {
            pageState = PageState.HOVER;

            $(".img-container").first().removeClass("d-none");
            disablePreviousActiveElement(activeElement);
            activeElement = ActiveElement.LANDING;
        }

        $(".landing-picture").first()
            .attr("src", "images/" + hoverPictureID + (hoverPictureID === "kyudo" ? ".gif" : ".jpg"));
        if (hoverPictureID === "kyudo") {
            $(".landing-picture").first()
                .addClass("kyudo-gif");
        }
    }, () => {
        $(".landing-picture").first()
            .attr("src", "images/profile.jpg");

        if (hoverPictureID === "kyudo") {
            $(".landing-picture").first()
                .removeClass("kyudo-gif");
        }
    });
}

function animateProgressBars(progressBars, reset) {
    for (const progressBarID in progressBars) {
        $("." + progressBarID).animate({
            width: reset === Animation.FILL ? progressBars[progressBarID] : 0
        }, 100);
    }
}

function disablePreviousActiveElement(previousActiveElement) {
    switch (previousActiveElement) {
        case ActiveElement.LANDING:
            $(".img-container").first().addClass("d-none");
            break;
        case ActiveElement.SKILLS:
            $(".img-container").first().removeClass("d-none");
            $(".technical-skills").first().addClass("d-none");
            animateProgressBars(SKILL_BAR_PROGRESS, Animation.RESET);
            activeElement = ActiveElement.LANDING;
            break;
        case ActiveElement.MAP:
            $(".img-container").first().removeClass("d-none");
            $(".map").first().addClass("d-none");
            activeElement = ActiveElement.LANDING;
            break;
        case ActiveElement.EDUCATION:
            $(".img-container").first().removeClass("d-none");
            $(".education").first().addClass("d-none");
            activeElement = ActiveElement.LANDING;
            break;
        case ActiveElement.LANGUAGES:
            $(".img-container").first().removeClass("d-none");
            $(".japanese").first().addClass("d-none");
            activeElement = ActiveElement.LANDING;
            break;
        case ActiveElement.PROFESSOR:
            $(".img-container").first().removeClass("d-none");
            $(".professor").first().addClass("d-none");
            activeElement = ActiveElement.LANDING;
            break;
        case ActiveElement.SKANDINAVISKA:
            $(".img-container").first().removeClass("d-none");
            $(".skandinaviska").first().addClass("d-none");
            activeElement = ActiveElement.LANDING;
            break;
        case ActiveElement.PITCHFORK:
            $(".img-container").first().removeClass("d-none");
            $(".pitchfork").first().addClass("d-none");
            activeElement = ActiveElement.LANDING;
            break;
    }
}

function addListeners() {
    // Window resize listener
    window.addEventListener("resize", windowSizeCheck);

    // Listeners for picture hover events
    HOVER_PICTURES.forEach(addPictureHoverListener);

    // Adds the rest of the non-D3 listeners
    LISTENER_IDS.forEach((id) => {
        $("#" + id).hover(() => {
            if (pageState === PageState.CLICK) {
                pageState = PageState.HOVER;
            }

            $("." + id).first().removeClass("d-none");
            disablePreviousActiveElement(activeElement);

            switch (id) {
                case "japanese":
                    activeElement = ActiveElement.LANGUAGES;
                    break;
                case "education":
                    activeElement = ActiveElement.EDUCATION;
                    break;
                case "technical-skills":
                    activeElement = ActiveElement.SKILLS;
                    animateProgressBars(SKILL_BAR_PROGRESS, Animation.FILL);
                    break;
                case "map":
                    activeElement = ActiveElement.MAP;
                    break;
                case "professor":
                    activeElement = ActiveElement.PROFESSOR;
                    break;
                case "skandinaviska":
                    activeElement = ActiveElement.SKANDINAVISKA;
                    break;
                case "pitchfork":
                    activeElement = ActiveElement.PITCHFORK;
                    break;
            }
        }, () => {

            // Disables listeners if hover event ends
            disablePreviousActiveElement(activeElement);
        });
    });
}

function windowMobileCheck() {
    // From https://stackoverflow.com/a/11381730
    // Checks if user is using a mobile platform using regex
    // Returns true if so

    let check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check && currentWindowSize === WindowSize.OTHER;
}

function windowSizeCheck() {
    // Get width and height of the window excluding scrollbars
    var screenWidth = document.documentElement.clientWidth;

    // Check if user is using mobile or if the screen is small enough to switch to single-column view
    if (windowMobileCheck() || (currentWindowSize === WindowSize.OTHER && screenWidth < MOBILE_WINDOW_SIZE_THRESHOLD)) {

        // Activate mobile modal if so
        $('#mobileModal').modal('show');
        currentWindowSize = WindowSize.MOBILE;
    }

    // If user goes back to larger screen size, reset settings to prepare the modal to reappear if necessary
    if (currentWindowSize == WindowSize.MOBILE && screenWidth >= MOBILE_WINDOW_SIZE_THRESHOLD) {
        currentWindowSize = WindowSize.OTHER;
    }
}

// MAIN
function main() {
    addListeners();
}

// $(document).ready(() => {
//
//     // Quick preliminary check to see if user's screen is under the current functioning threshold
//     if (document.documentElement.clientWidth < MOBILE_WINDOW_SIZE_THRESHOLD) {
//
//         // Activate modal for explanation if so, and set settings to MOBILE
//         $('#mobileModal').modal('show');
//         currentWindowSize = WindowSize.MOBILE;
//     }
//
//     main();
// });
main();
