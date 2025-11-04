/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

const hangman_words = {
    1: ["wolf", "lime", "book", "dark", "zone"],
    2: ["crisp", "flame", "whale", "skirt", "brick"],
    3: ["timber", "silver", "public", "guitar", "travel"],
    4: ["fantasy", "diamond", "captain", "gallery", "freedom"],
    5: ["terminal", "treasure", "doctrine", "sculpture", "evidence"],
    6: ["navigator", "challenge", "strategic", "celebrity", "innovator"],
    7: ["astrophysics", "philanthropy", "cryptocurrency", "microprocessor", "photosynthesis"],
    8: ["oversimplification", "uncharacteristically", "incomprehensibility"],
    9: ["constitutionalism", "psychotherapeutic", "neurotransmitter"],
    10: ["interconnectivity", "counterintelligence", "intercontinental"]
};

export default class Hangman {
    constructor() {
        this.loading_time = null;
        this.difficulty = null;
        this.guesses = null;
        this.time_remaining = null;
        this.word = null;
        this.displayed_word = null;

        this.audio = {
            downloaded: "assets/audio/reinforced.ogg",
            uploaded: "assets/audio/reinforced.ogg",
            accessed: "assets/audio/reinforced.ogg",
            low_time: "assets/audio/beep.ogg",
            success: "assets/audio/succeeded.ogg",
            failed: "assets/audio/system_fault.ogg",
            volume: 0.2
        };
    }

    init(data) {
        this.loading_time = data.loading_time || 4000;
        this.difficulty = data.difficulty || 1;
        this.guesses = 6;
        this.time_remaining = data.timer || 30000;

        $(document).on("keyup", e => e.key === "Escape" && this.game_end(false));
        this.build_loading();
    }


    build_loading() {
        const content = `
            <div class="minigame_container">
                <div class="hangman_loading">
                    <div class="hangman_loading_icons">
                        <span class="hangman_icon" id="icon_1"><i class="fa-solid fa-download"></i></span>
                        <span class="hangman_icon" id="icon_2"><i class="fa-solid fa-upload"></i></span>
                        <span class="hangman_icon" id="icon_3"><i class="fa-solid fa-satellite-dish"></i></span>
                    </div>
                    <div class="hangman_loading_text" id="loading_text">Initializing Hangman.exe...</div>
                </div>
            </div>
        `;
        $("#main_container").html(content);
        this.start_loading_sequence();
    }

    start_loading_sequence() {
        this.flash_icon("#icon_1", "Downloading vocabulary...");
        setTimeout(() => {
            this.play_sound("downloaded");
            this.complete_icon("#icon_1");
            this.flash_icon("#icon_2", "Encrypting session...");
        }, this.loading_time / 3);
        setTimeout(() => {
            this.play_sound("uploaded");
            this.complete_icon("#icon_2");
            this.flash_icon("#icon_3", "Connecting to word server...");
        }, (this.loading_time / 3) * 2);
        setTimeout(() => {
            this.play_sound("accessed");
            this.complete_icon("#icon_3");
            $("#loading_text").text("Connection successful!");
        }, this.loading_time);
        setTimeout(() => this.build_game_area(), this.loading_time + 1000);
    }

    flash_icon(icon, text) {
        $(".hangman_icon").removeClass("loading");
        $(icon).addClass("loading");
        $("#loading_text").text(text);
    }

    complete_icon(icon) {
        $(icon).removeClass("loading").addClass("done");
    }

    build_game_area() {
        this.select_word(this.difficulty);
        this.displayed_word = "_".repeat(this.word.length).split("").join(" ");
        const keyboard = this.generate_keyboard();

        const content = `
            <div class="minigame_container">
                <div class="hangman_window">
                    <div class="hangman_window_toolbar">
                        <span class="hangman_guesses_left">Guesses Remaining: ${this.guesses}</span>
                        <span class="hangman_game_timer">Time Remaining: ${Math.floor(this.time_remaining / 1000)}s</span>
                    </div>
                    <div class="hangman_window_body">
                        <pre class="hangman_state_display">${this.get_hangman_state()}</pre>
                        <div id="hangman_word_display">${this.displayed_word}</div>
                        ${keyboard}
                    </div>
                </div>
            </div>
        `;
        $("#main_container").html(content);
        this.bind_keyboard();
        this.start_timer();
    }

    select_word(level) {
        const list = hangman_words[level] || hangman_words[1];
        this.word = list[Math.floor(Math.random() * list.length)].toUpperCase();
    }

    generate_keyboard() {
        const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
        return rows.map(row =>
            `<div class="keyboard_row">
                ${[...row].map(l => `<button class="keyboard_key" data-letter="${l}">${l}</button>`).join("")}
             </div>`
        ).join("");
    }

    bind_keyboard() {
        $(".keyboard_key").on("click", e => {
            const letter = $(e.target).attr("data-letter");
            this.handle_guess(letter);
        });
    }

    handle_guess(letter) {
        const upper = letter.toUpperCase();
        const key = $(`.keyboard_key[data-letter=${upper}]`);
        key.prop("disabled", true);

        if (this.word.includes(upper)) {
            this.update_word(upper);
        } else {
            this.guesses--;
            $(".hangman_guesses_left").text(`Guesses Remaining: ${this.guesses}`);
        }

        $(".hangman_state_display").text(this.get_hangman_state());

        if (this.guesses <= 0 || !this.displayed_word.includes("_")) {
            const success = this.displayed_word.replace(/ /g, "") === this.word;
            this.game_end(success);
        }
    }


    update_word(letter) {
        let updated = "";
        for (let i = 0; i < this.word.length; i++) {
            updated += (this.word[i] === letter ? letter : this.displayed_word[i * 2]) + (i < this.word.length - 1 ? " " : "");
        }
        this.displayed_word = updated;
        $("#hangman_word_display").text(this.displayed_word);
    }

    start_timer() {
        this.timer_interval = setInterval(() => {
            this.time_remaining -= 1000;
            const t = $(".hangman_game_timer");
            t.text(`Time Remaining: ${Math.floor(this.time_remaining / 1000)}s`);
            if (this.time_remaining <= 10000) {
                this.play_sound("low_time");
            }
            if (this.time_remaining <= 0) {
                clearInterval(this.timer_interval);
                this.game_end(false);
            }
        }, 1000);
    }

    game_end(success) {
        clearInterval(this.timer_interval);
        const message = success ? "SUCCESS" : "FAILED";
        const sound = success ? "success" : "failed";

        const content = `
            <div class="hangman_result_screen">
                ${message}
            </div>
        `;
        $(".minigame_container").html(content);
        this.play_sound(sound);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "hangman", success }));
        }, 3000);
    }

    play_sound(key) {
        const audio = new Audio(this.audio[key]);
        audio.volume = this.audio.volume;
        audio.play();
    }

    get_hangman_state() {
        const stages = [
            ` _______\n |     |\n       |\n       |\n       |\n       |\n========`,
            ` _______\n |     |\n O     |\n       |\n       |\n       |\n========`,
            ` _______\n |     |\n O     |\n |     |\n       |\n       |\n========`,
            ` _______\n |     |\n O     |\n/|     |\n       |\n       |\n========`,
            ` _______\n |     |\n O     |\n/|\\    |\n       |\n       |\n========`,
            ` _______\n |     |\n O     |\n/|\\    |\n/      |\n       |\n========`,
            ` _______\n |     |\n O     |\n/|\\    |\n/ \\    |\n       |\n========`
        ];
        return stages[this.guesses >= 0 ? 6 - this.guesses : 6];
    }

}