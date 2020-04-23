const HOVER_PICTURES = [
    "profile",
    "mexico",
    "kyudo"
];

const SKILL_BAR_PROGRESS = {
    "python-bar": "90%",
    "html-bar": "70%",
    "css-bar": "65%",
    "js-bar": "85%",
    "java-bar": "90%",
    "c-sharp-bar": "85%",
    "bootstrap-bar": "70%",
    "jquery-bar": "70%",
    "d3-bar": "85%"
};

const LISTENER_IDS = [
    "japanese",
    "education",
    "technical-skills",
    "map"
];

const INSTRUMENT_BAR_PROGRESS = {
    "bass": "90%",
    "guitar": "70%",
    "piano": "60%",
    "ukulele": "60%"
}

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
    LANGUAGES: 5
}

var currentLanguage = Language.ENGLISH;
var pageState = PageState.HOVER;
var activeElement = ActiveElement.LANDING;

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
    }
}

function addListeners() {
    HOVER_PICTURES.forEach(addPictureHoverListener);

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
            }
        }, () => {
            disablePreviousActiveElement(activeElement);
        });
    });
}

// MAIN
function main() {
    addListeners();
}

$(document).ready(() => {
    main();
});
