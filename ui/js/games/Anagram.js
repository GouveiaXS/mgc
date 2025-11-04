/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

const anagram_word_lists = {
    1: ["wolf", "lime", "book", "dark", "zone"],
    2: ["crisp", "flame", "whale", "skirt", "brick"], 
    3: ["timber", "silver", "public", "guitar", "travel"],
    4: ["fantasy", "diamond", "captain", "gallery", "freedom"],
    5: ["terminal", "treasure", "doctrine", "sculpture", "evidence"],
    6: ["navigator", "challenge", "strategic", "celebrity", "innovator"],
    7: ["astrophysics", "philanthropy", "cryptocurrency", "microprocessor", "photosynthesis"],
    8: ["misinterpretation", "oversimplification", "uncharacteristically", "disproportionately", "incomprehensibility"],
    9: ["constitutionalism", "interdisciplinary", "misappropriation", "psychotherapeutic", "neurotransmitter"],
    10: ["interconnectivity", "counterintelligence", "uncompromisingly", "indistinguishable", "intercontinental"]
};

export default class Anagram {
    constructor() {
        this.loading_time = null;
        this.difficulty = null;
        this.guesses = null;
        this.time_remaining = null;

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
        this.loading_time = data.loading_time || 5000;
        this.difficulty = data.difficulty || 1;
        this.guesses = data.guesses || 5;
        this.time_remaining = data.timer || 30000;

        $(document).on("keyup", (e) => {
            if (e.key === "Escape") this.game_end(false);
        });

        this.build_ui();
    }

    build_ui() {
        let audio_elements = '';
        for (const key in this.audio) {
            if (key !== 'volume') {
                audio_elements += `<audio id="${key}_sound" src="${this.audio[key]}" preload="auto"></audio>`;
            }
        }

        const content = `
            <div class="minigame_container">
                <div class="anagram_loading">
                    <div class="anagram_loading_icons">
                        <span class="anagram_loading_icon_1"><i class="fa-solid fa-lock"></i></span>
                        <span class="anagram_loading_icon_2"><i class="fa-solid fa-unlock"></i></span>
                        <span class="anagram_loading_icon_3"><i class="fa-solid fa-lock-open"></i></span>
                    </div>
                    <div class="anagram_loading_text">Loading...</div>
                </div>
            </div>
            ${audio_elements}
        `;

        $('#main_container').html(content);

        for (const key in this.audio) {
            if (key !== 'volume') {
                $(`#${key}_sound`)[0].volume = this.audio.volume;
            }
        }

        this.start_loading_sequence();
    }

    start_loading_sequence() {
        this.flash_icon(".anagram_loading_icon_1", "Initializing pwcrack.exe...");
        setTimeout(() => {
            this.play_sound("downloaded");
            this.complete_icon(".anagram_loading_icon_1");
            this.flash_icon(".anagram_loading_icon_2", "Encrypting TCP/IP ports...");
        }, this.loading_time / 4);

        setTimeout(() => {
            this.play_sound("uploaded");
            this.complete_icon(".anagram_loading_icon_2");
            this.flash_icon(".anagram_loading_icon_3", "Bypassing firewall...");
        }, this.loading_time / 2);

        setTimeout(() => {
            this.play_sound("accessed");
            this.complete_icon(".anagram_loading_icon_3");
            this.end_loading_sequence("System breached successfully!");
        }, this.loading_time);
    }

    flash_icon(icon_class, text) {
        $(".anagram_loading_icons span").removeClass("flashing");
        $(icon_class).addClass("flashing");
        $(".anagram_loading_text").text(text);
    }

    complete_icon(icon_class) {
        $(icon_class).addClass("line_complete");
    }

    end_loading_sequence(text) {
        $(".anagram_loading_text").text(text);
        setTimeout(() => {
            $(".anagram_loading_icons").fadeOut(500);
        }, 1000);
        setTimeout(() => {
            $(".anagram_loading").fadeOut(500);
            this.build_game_area();
        }, 2000);
    }

    build_game_area() {
        this.select_word();
        this.shuffled_word = this.shuffle_word(this.original_word);
        const content = `
            <div class="anagram_game">
                <div class="minigame_header">
                    <span class="anagram_guesses_left">Guesses Remaining: ${this.guesses}</span>
                    <span class="anagram_game_timer" style="margin-right: 2vh;">Time Remaining: ${Math.floor(this.time_remaining / 1000)}s</span>
                </div>
                <div class="anagram_body">
                    <div class="anagram_previous_guesses"></div>
                </div>
                <div class="anagram_footer">
                    <input type="text" class="anagram_input" placeholder="Enter password...">
                    <button class="anagram_submit">Submit</button>
                    <div class="anagram_password">Password: <span>${this.shuffled_word}</span></div>
                </div>
            </div>
        `;

        $(".minigame_container").html(content);
        $(".anagram_submit").click(() => this.submit_guess());
        this.start_timer();
    }

    select_word() {
        const list = anagram_word_lists[`${this.difficulty}`] || anagram_word_lists[1];
        this.original_word = list[Math.floor(Math.random() * list.length)];
    }

    shuffle_word(word) {
        const shuffled = word.split('');
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.join('');
    }

    submit_guess() {
        const guess = $(".anagram_input").val().toLowerCase();
        if (guess !== this.original_word) {
            this.guesses--;
            $(".anagram_previous_guesses").append(`<div class="guess wrong">Incorrect: ${guess}</div>`);
            $(".anagram_guesses_left").text(`Guesses Remaining: ${this.guesses}`);
            if (this.guesses <= 0) this.game_end(false);
        } else {
            $(".anagram_previous_guesses").append(`<div class="guess correct">Correct: ${guess}</div>`);
            setTimeout(() => this.game_end(true), 1000);
        }
        $(".anagram_input").val('');
    }

    start_timer() {
        this.timer_interval = setInterval(() => {
            this.time_remaining -= 1000;
            const seconds = Math.floor(this.time_remaining / 1000);
            const timer = $(".anagram_game_timer");
            timer.text(`Time Remaining: ${seconds}s`);
            if (this.time_remaining <= 10000) {
                timer.css("color", "rgba(153, 0, 0, 1)");
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
        const result = success ? "success" : "failed";
        this.play_sound(result);
        const content = `
            <div class="anagram_result">${result.toUpperCase()}</div>
        `;
        $(".minigame_container").html(content);
        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "anagram", success }));
        }, 3000);
    }

    play_sound(key) {
        const el = $(`#${key}_sound`)[0];
        if (el) el.play();
    }
}