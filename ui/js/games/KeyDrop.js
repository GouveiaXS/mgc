/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class KeyDrop {
    constructor() {
        this.audio = {
            hit: "/ui/assets/audio/beep.ogg",
            miss: "/ui/assets/audio/slick.ogg",
            success: "/ui/assets/audio/succeeded.ogg",
            failed: "/ui/assets/audio/system_fault.ogg",
            volume: 0.2,
        };

        this.score_limit = null;
        this.miss_limit = null;
        this.fall_delay = null;
        this.new_letter_delay = null;

        this.score = 0;
        this.misses = 0;
        this.interval_cleared = false;
        this.timeout_id = null;
    }

    init(data) {
        this.score_limit = data.score_limit || 3;
        this.miss_limit = data.miss_limit || 3;
        this.fall_delay = data.fall_delay || 1500;
        this.new_letter_delay = data.new_letter_delay || 2000;

        this.build_ui();
        this.start_game();
    }

    build_ui() {
        const content = `<div class="kd_container"></div>`;
        $("#main_container").html(content);
    }

    start_game() {
        $(".kd_letter").remove();
        const $game_container = $("<div>", { class: "key_drop_game" });
        $(".kd_container").append($game_container);
        this.drop_letter();
        this.build_key_presses();
    }

    drop_letter() {
        const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const position = Math.floor(Math.random() * ($(".key_drop_game").width() - 10));
        const $letter = $("<div>", {
            class: "kd_letter",
            text: letter
        }).css({ top: "-80px", left: `${position}px` });

        $(".key_drop_game").append($letter);

        $letter.animate({ top: "75vh" }, this.fall_delay, () => {
            if (!$letter.hasClass("kd_hit")) {
                $letter.addClass("kd_miss");
                this.play_sound(this.audio.miss);
                this.misses++;

                if (this.misses >= this.miss_limit && !this.interval_cleared) {
                    clearTimeout(this.timeout_id);
                    setTimeout(() => this.game_end(false), this.new_letter_delay);
                    this.interval_cleared = true;
                }
            }
        });

        if (!this.interval_cleared) {
            this.timeout_id = setTimeout(() => this.drop_letter(), this.new_letter_delay);
        }
    }

    build_key_presses() {
        $(document).off("keyup").on("keyup", (event) => {
            const key = event.key.toUpperCase();

            const $letter = $(".kd_letter").filter(function () {
                const $el = $(this);
                return $el.text() === key && !$el.hasClass("kd_hit") && !$el.hasClass("kd_miss");
            }).first();

            if ($letter.length) {
                $letter.addClass("kd_hit").stop();
                this.play_sound(this.audio.hit);
                this.score++;

                if (this.score === this.score_limit && !this.interval_cleared) {
                    clearTimeout(this.timeout_id);
                    setTimeout(() => this.game_end(true), this.new_letter_delay);
                    this.interval_cleared = true;
                }
            }
        });
    }


    game_end(success) {
        clearTimeout(this.timeout_id);
        $(".kd_letter").remove();
        $(".kd_container").empty();
        this.play_sound(success ? this.audio.success : this.audio.failed);
        $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "keydrop", success }));
    }

    play_sound(path) {
        const sound = new Audio(path);
        sound.volume = this.audio.volume;
        sound.play();
    }
}
