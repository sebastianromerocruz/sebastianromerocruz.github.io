const HOVER_PICTURES = [
    "profile",
    "mexico",
    "japanese"
];

const JAPANESE_TRANSLATIONS = {
    "title": [
        "セバスチャンです。",
        "hi, i'm <span class=\"hover-photo-text\" id=\"profile\">sebastián</span>"
    ],
    "intro": [
        "NYで、フロントエンド開発者と大学の教師にとして働いています。",
        "i am a nyc-based professor and <span class=\"hover-photo-text\" id=\"developer\">developer</span>."
    ],
    "vocation": [
        "メキシコ出身で、ニューヨーク大学で化学工学もコンピューター科学も、私は勉強しました。",
        "i was born in <span class=\"hover-photo-text\" id=\"mexico\">mexico city</span>, and studied <span class=\"hover-photo-text\" id=\"cbe\">chemical and biomolecular engineering</span> and later computer science at <span class=\"hover-photo-text\" id=\"nyu\">nyu</span>."
    ],
    "explanation": [
        "専門は技術的だったのに、自分の作品になると色々な分野からインスピレーションを入れて、できるだけクリエーティブにするのが好きです。",
        "quantitative as my training may be, i like to be as creative in my work as i can, bringing in inspiration from a number of other crafts."
    ],
    "hobbies": ["", ""],
    "contact": [
        "InstagramにもLinkedInにも私が見つかります。",
        "you can find me on instagram shooting on cheap disposable cameras, or on linkedin if you're more into that sort of thing."
    ],
    "resume": [
        "それに、私の履歴書が見たかったら、ごゆっくりどうぞ。",
        "you can also check my résumé out <span>here</span>."
    ]
};

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

var currentLanguage = Language.ENGLISH;
var pageState = PageState.HOVER;

function addProgressHoverListener() {
    $("#developer").hover(() => {
        if (pageState === PageState.CLICK) {
            pageState = PageState.HOVER;
        }
        $(".landing-picture").first().addClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().removeClass("d-none");
        animateProgressBars(SKILL_BAR_PROGRESS, Animation.FILL);
    }, () => {
        $(".landing-picture").first().removeClass("d-none");
        $(".technical-skills").first().addClass("d-none");

        animateProgressBars(SKILL_BAR_PROGRESS, Animation.RESET);
    });
}

function addEducationClickListener() {
    $("#nyu").click(() => {
        pageState = PageState.CLICK;
        $(".landing-picture").first().addClass("d-none");
        $(".education").first().removeClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        // animateProgressBars(SKILL_BAR_PROGRESS, Animation.FILL);
    });
}

function addPictureHoverListener(hoverPictureID, index) {
    if (hoverPictureID == "japanese") {
        var keys = Object.keys(JAPANESE_TRANSLATIONS);
        $("#" + hoverPictureID).hover(() => {
            keys.forEach(replaceText);
            currentLanguage = currentLanguage === Language.ENGLISH ? Language.JAPANESE : Language.ENGLISH;
        }, () => {
            keys.forEach(replaceText);
            currentLanguage = currentLanguage === Language.ENGLISH ? Language.JAPANESE : Language.ENGLISH;
        });
        return
    }

    $("#" + hoverPictureID).hover(() => {
        if (pageState === PageState.CLICK) {
            pageState = PageState.HOVER;
            
            $(".landing-picture").first().removeClass("d-none");
            $(".education").first().addClass("d-none");
            $(".technical-skills").first().addClass("d-none");
        }

        $(".landing-picture").first()
            .attr("src", "images/" + hoverPictureID + ".jpg");
    }, () => {
        $(".landing-picture").first()
            .attr("src", "images/profile.jpg");
    });
}

function replaceText(paragraphIDs, index) {
    if (currentLanguage === Language.ENGLISH) {
        $("#" + paragraphIDs).addClass("japanese-text");
        console.log("adding class");
    } else {
        $("#" + paragraphIDs).removeClass("japanese-text");
        console.log("removing class");
    }
    if (paragraphIDs !== "hobbies") {
        $("#" + paragraphIDs).html(
            JAPANESE_TRANSLATIONS[paragraphIDs][currentLanguage === Language.ENGLISH ? 0 : 1]
        );
    }
}

function animateProgressBars(progressBars, reset) {
    for (const progressBarID in progressBars) {
        $("." + progressBarID).animate({
            width: reset === Animation.FILL ? progressBars[progressBarID] : 0
        }, 100);
    }
}

// MAIN
function main() {
    HOVER_PICTURES.forEach(addPictureHoverListener);
    addProgressHoverListener();
    addEducationClickListener();
}

$(document).ready(() => {
    main();
});
