/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class Bitflip {
    constructor() {
        this.config = {
            timer: 15000,
            code_length: 8
        };
        this.player_code = [];
        this.target_code = [];
        this.remaining = 15000;
        this.timer = null;
        this.success = false;
        this.audio = {
            success: "assets/audio/succeeded.ogg",
            failed: "assets/audio/system_fault.ogg",
            low_time: "assets/audio/beep.ogg",
            volume: 0.2
        };
    }

    async init(data) {
        await document.fonts.load("12px 'VT323'");
        this.config = { ...this.config, ...data };
        this.remaining = this.config.timer;
        this.generate_codes();
        this.build_ui();
        this.start_timer();
    }

    generate_codes() {
        this.player_code = [];
        this.target_code = [];
        for (let i = 0; i < this.config.code_length; i++) {
            this.player_code.push(Math.random() > 0.5 ? 1 : 0);
            this.target_code.push(Math.random() > 0.5 ? 1 : 0);
        }
    }

    build_ui() {
        const player_bits = this.player_code.map((bit, i) => {
            return `<div class="bit_flip_bit" data-index="${i}">${bit}</div>`;
        }).join("");

        const target_bits = this.target_code.map(bit => {
            return `<div class="bit_flip_bit">${bit}</div>`;
        }).join("");

        const content = `
            <div class="minigame_container bit_flip">
                <div class="bit_flip_wrapper">
                    <div class="bit_flip_toolbar">
                        <div class="bit_flip_timer">Time Remaining: ${Math.floor(this.remaining / 1000)}s</div>
                    </div>
                    <div class="bit_flip_row_label">Target Code</div>
                    <div class="bit_flip_bits target_bits">${target_bits}</div>
                    <div class="bit_flip_row_label">Your Code</div>
                    <div class="bit_flip_bits player_bits">${player_bits}</div>
                </div>
            </div>
        `;

        $("#main_container").html(content);

        $(".player_bits .bit_flip_bit").on("click", (e) => {
            const index = parseInt($(e.currentTarget).data("index"));
            this.player_code[index] = this.player_code[index] === 1 ? 0 : 1;
            this.update_ui();
            if (this.check_win()) this.end_game(true);
        });

        this.update_ui();
    }

    update_ui() {
        $(".player_bits .bit_flip_bit").each((i, el) => {
            const bit = this.player_code[i];
            $(el).text(bit);
            if (bit === this.target_code[i]) {
                $(el).addClass("correct");
            } else {
                $(el).removeClass("correct");
            }
        });
    }

    check_win() {
        return this.player_code.every((bit, i) => bit === this.target_code[i]);
    }

    start_timer() {
        this.timer = setInterval(() => {
            this.remaining -= 1000;
            $(".bit_flip_timer").text(`Time Remaining: ${Math.floor(this.remaining / 1000)}s`);

            if (this.remaining <= 0) {
                clearInterval(this.timer);
                this.end_game(false);
            }

            if (this.remaining <= 5000) {
                $(".bit_flip_timer").css("color", "rgba(255,0,0,0.9)");
                this.play_sound("low_time");
            }
        }, 1000);
    }

    end_game(success) {
        clearInterval(this.timer);
        this.success = success;

        const result = success ? "SUCCESS" : "FAILED";
        const color = success ? "rgba(255,255,255,0.9)" : "rgba(255,50,50,0.9)";
        const audio = success ? "success" : "failed";

        const overlay = `
            <div class="bit_flip_result_screen" style="color:${color};">
                ${result}
            </div>
        `;

        $(".minigame_container").html(overlay);
        this.play_sound(audio);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "bit_flip", success }));
        }, 2500);
    }

    play_sound(key) {
        const url = this.audio[key];
        if (!url) return;
        const audio = new Audio(url);
        audio.volume = this.audio.volume;
        audio.play();
    }
}