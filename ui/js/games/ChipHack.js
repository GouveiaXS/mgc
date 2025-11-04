/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class ChipHack {
    constructor() {
        this.loading_time = null;
        this.chips_found = 0;
        this.chips_needed = null;
        this.time_remaining = null;
        
        this.audio = {
            downloaded: 'assets/audio/reinforced.ogg',
            uploaded: 'assets/audio/reinforced.ogg',
            accessed: 'assets/audio/reinforced.ogg',
            clicked_chip: 'assets/audio/slick.ogg',
            low_time: 'assets/audio/beep.ogg',
            success: 'assets/audio/succeeded.ogg',
            failed: 'assets/audio/system_fault.ogg',
            volume: 0.2
        };
    }

    init(data) {
        this.loading_time = data.loading_time || 5000;
        this.chips_needed = data.chips || 5;
        this.time_remaining = data.timer || 60000;

        $(document).on("keyup", (e) => {
            if (e.key === "Escape" || e.key === "Backspace") {
                this.game_end(false);
            }
        });

        this.build_ui();
    }

    build_ui() {
        let audio_elements = '';
        for (let key in this.audio) {
            if (key !== 'volume') {
                audio_elements += `<audio id="${key}_sound" src="${this.audio[key]}" preload="auto"></audio>`;
            }
        }

        const content = `
            <div class="minigame_container">
                <div class="chip_hack_loading">
                    <div class="chip_hack_loading_icons">
                        <span class="chip_hack_loading_icon_1"><i class="fa-solid fa-virus"></i></span>
                        <span class="chip_hack_loading_icon_2"><i class="fa-solid fa-server"></i></span>
                        <span class="chip_hack_loading_icon_3"><i class="fa-solid fa-microchip"></i></span>
                    </div>
                    <div class="chip_hack_loading_text">Loading...</div>
                </div>
            </div>
            ${audio_elements}
        `;

        $('#main_container').html(content);

        for (let key in this.audio) {
            if (key !== 'volume') {
                $(`#${key}_sound`)[0].volume = this.audio.volume;
            }
        }

        this.start_loading_sequence();
    }

    start_loading_sequence() {
        this.flash_icon('.chip_hack_loading_icon_1', 'Downloading virus...');
        setTimeout(() => {
            this.play_sound('downloaded');
            this.complete_icon('.chip_hack_loading_icon_1');
            this.flash_icon('.chip_hack_loading_icon_2', 'Uploading virus...');
        }, this.loading_time / 4);
        setTimeout(() => {
            this.play_sound('uploaded');
            this.complete_icon('.chip_hack_loading_icon_2');
            this.flash_icon('.chip_hack_loading_icon_3', 'Accessing hardware...');
        }, this.loading_time / 2);
        setTimeout(() => {
            this.play_sound('accessed');
            this.complete_icon('.chip_hack_loading_icon_3');
            this.end_loading_sequence('Connection successful!');
        }, this.loading_time);
    }

    flash_icon(icon_class, text) {
        $(".chip_hack_loading_icons span").removeClass("flashing");
        $(icon_class).addClass("flashing");
        $(".chip_hack_loading_text").text(text);
    }

    complete_icon(icon_class) {
        $(icon_class).addClass("line_complete");
    }

    end_loading_sequence(text) {
        $(".chip_hack_loading_text").text(text);
        setTimeout(() => $(".chip_hack_loading_icons").fadeOut(500), 1000);
        setTimeout(() => {
            $(".chip_hack_loading").fadeOut(500);
            this.build_game_area();
        }, 2000);
    }

    build_game_area() {
        const content = `
            <div class="chip_hack_game">
                <div class="chip_hack_toolbar">
                    <span class="chip_hack_counter">Chips Found: ${this.chips_found} / ${this.chips_needed}</span>
                    <span class="chip_hack_timer">Time Remaining: ${Math.floor(this.time_remaining / 1000)}s</span>
                </div>
                <div class="chip_hack_play_area">
                    <div class="chip_hack_light"></div>
                </div>
            </div>
        `;
        $(".minigame_container").html(content);

        this.setup_flashlight();
        this.setup_game_events();
        this.place_chip();
        this.start_timer();
    }

    setup_flashlight() {
        const area = $(".chip_hack_play_area");
        const light = $(".chip_hack_light");
        const r = 30;
        area.mousemove((e) => {
            const offset = area.offset();
            let x = e.pageX - offset.left - r;
            let y = e.pageY - offset.top - r;
            x = Math.max(0, Math.min(x, area.width() - 2 * r));
            y = Math.max(0, Math.min(y, area.height() - 2 * r));
            light.css({ left: `${x}px`, top: `${y}px` });
        });
    }

    setup_game_events() {
        const area = $(".chip_hack_play_area");
        area.on("mousemove", (e) => {
            const offset = area.offset();
            const x = e.pageX;
            const y = e.pageY;
            $(".chip").each(function () {
                const chip_offset = $(this).offset();
                const distance = Math.sqrt(Math.pow(chip_offset.left - x, 2) + Math.pow(chip_offset.top - y, 2));
                $(this).css("opacity", distance < 25 ? 1 : 0);
            });
        });
    }

    place_chip() {
        $(".chip").remove();
        const area = $(".chip_hack_play_area");
        const chip = $('<i class="fa-solid fa-microchip chip"></i>');
        chip.css({
            color: "var(--accent)",
            fontSize: "1.5rem",
            position: "absolute"
        });

        const x = Math.random() * (area.width() - 50);
        const y = Math.random() * (area.height() - 50);
        chip.css({ left: `${x}px`, top: `${y}px` });

        chip.click(() => this.handle_chip_click());
        area.append(chip);
    }

    handle_chip_click() {
        this.play_sound("clicked_chip");
        this.chips_found++;
        $(".chip_hack_counter").text(`Chips Found: ${this.chips_found} / ${this.chips_needed}`);
        this.time_remaining += 5000;
        if (this.chips_found < this.chips_needed) {
            this.place_chip();
        } else {
            this.game_end(true);
        }
    }

    start_timer() {
        this.timer_interval = setInterval(() => {
            this.time_remaining -= 1000;
            const seconds = Math.floor(this.time_remaining / 1000);
            const timerEl = $(".chip_hack_timer");
            timerEl.text(`Time Remaining: ${seconds}s`);
            if (this.time_remaining <= 10000) {
                timerEl.css({ color: "rgba(153, 0, 0, 1)" });
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
        const text = success ? "SUCCESS" : "FAILED";
        this.play_sound(success ? "success" : "failed");
        const content = `
            <div class="chip_hack_result">${text}</div>
        `;
        $(".minigame_container").html(content);
        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "chip_hack", success }));
        }, 2000);
    }

    play_sound(key) {
        const el = $(`#${key}_sound`)[0];
        if (el) el.play();
    }
}