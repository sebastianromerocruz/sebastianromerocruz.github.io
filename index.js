const HOVER_PICTURES = [
    "profile",
    "mexico",
];

const JAPANESE_HTML = `<h1>私は<span class="hover-photo-text">セバスチャン</span>といいます。</h1>
<p>
    NYCで、大学教授兼フロントエンド<span class="hover-photo-text">開発者</span>として働いています。
</p>
<p>
    私は<span class="hover-photo-text">メキシコ</span>出身で、<span class="hover-photo-text">ニューヨーク大学</span>において化学工学とコンピューター科学を、勉強しました。
</p>
<p>
    専門は技術的でしたが、色々な分野からインスピレーションを取り入れて、できるだけクリエーティブにするのが好きです。
</p>
<p>
    私の趣味は、外国語の学習、音楽、そして弓道です。
</p>
<p>
    使い捨てカメラを使ってますけど<a class="hover-photo-text" href="https://www.instagram.com/ghstpkmn/">Instagram</a>も<a class="hover-photo-text" href="https://www.linkedin.com/in/sebastian-romerocruz/">LinkedIn</a>もやっています。
</p>
<p>
    私の<span class = "hover-photo-text">履歴書</span>にご興味のある方はぜひご覧になって下さい。
</p>`;

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

function addJapaneseHoverListener() {
    $("#japanese").hover(() => {
        if (pageState === PageState.CLICK) {
            pageState = PageState.HOVER;
        }

        $(".landing-picture").first().addClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        $(".japanese").first().removeClass("d-none");
    }, () => {
        $(".landing-picture").first().removeClass("d-none");
        $(".education").first().addClass("d-none");
        $(".technical-skills").first().addClass("d-none");
        $(".japanese").first().addClass("d-none");
    });
}

function addPictureHoverListener(hoverPictureID, index) {
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
    addJapaneseHoverListener();
}

$(document).ready(() => {
    main();
});
