/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class FrequencyJam {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.dial_count = 3;
        this.dials = [];
        this.selected_index = 0;
        this.remaining = 15000;
        this.success = false;
        this.config = {
            timer: 15000,
            dial_count: 3,
            max_value: 360
        };
        this.audio = {
            success: "assets/audio/succeeded.ogg",
            failed: "assets/audio/system_fault.ogg",
            low_time: "assets/audio/beep.ogg",
            volume: 0.2
        };
        this.timer = null;

        this.dial_radius = 40;
        this.dial_spacing = 60;
    }

    async init(data) {
        await document.fonts.load("12px 'VT323'");
        this.config = { ...this.config, ...data };
        this.dial_count = this.config.dials || this.config.dial_count;
        this.remaining = this.config.timer;
        this.build_ui();
    }

    build_ui() {
        const content = `
            <div class="minigame_container frequency_jam">
                <div class="minigame_header">
                    <div class="minigame_timer">Time Remaining: ${Math.floor(this.remaining / 1000)}s</div>
                </div>
                <div class="frequency_jam_canvas_wrapper">
                    <canvas id="frequency_jam_canvas"></canvas>
                </div>
                <div class="frequency_jam_submit_wrapper">
                    <button id="frequency_jam_submit">Submit</button>
                </div>
            </div>
        `;

        $("#main_container").html(content);

        const total_width = (this.dial_count * (this.dial_radius * 2)) + ((this.dial_count - 1) * this.dial_spacing);
        const canvas_width = total_width + 40;
        const canvas_height = this.dial_radius * 2 + 60;

        this.canvas = document.getElementById("frequency_jam_canvas");
        this.canvas.width = canvas_width;
        this.canvas.height = canvas_height;
        this.ctx = this.canvas.getContext("2d");

        this.generate_dials();
        this.draw();
        this.bind_events();
        this.start_timer();
    }

    generate_dials() {
        this.dials = Array.from({ length: this.dial_count }, () => ({
            angle: Math.floor(Math.random() * 360),
            target: Math.floor(Math.random() * 360)
        }));
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerY = h / 2;

        const total_dial_width = this.dial_count * (this.dial_radius * 2) + (this.dial_spacing * (this.dial_count - 1));
        const start_x = (w - total_dial_width) / 2 + this.dial_radius;

        ctx.clearRect(0, 0, w, h);

        this.dials.forEach((dial, i) => {
            const x = start_x + i * (this.dial_radius * 2 + this.dial_spacing);

            ctx.save();
            ctx.translate(x, centerY);
            ctx.rotate((dial.angle * Math.PI) / 180);

            ctx.beginPath();
            ctx.arc(0, 0, this.dial_radius, 0, 2 * Math.PI);
            ctx.fillStyle = i === this.selected_index ? "#e4ad29" : "#141414";
            ctx.fill();
            ctx.setLineDash([4, 3]);
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -this.dial_radius + 10);
            ctx.strokeStyle = "#666";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();

            const tolerance = this.config.precision || 5;
            const diff = Math.abs(dial.angle - dial.target) % 360;
            const closeness = Math.min(diff, 360 - diff);
            if (closeness <= tolerance) {
                ctx.beginPath();
                ctx.arc(x, centerY, this.dial_radius + 5, 0, 2 * Math.PI);
                ctx.strokeStyle = "rgba(0, 255, 0, 0.4)";
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        });
    }

    bind_events() {
        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;

            const total_dial_width = this.dial_count * (this.dial_radius * 2) + (this.dial_spacing * (this.dial_count - 1));
            const start_x = (this.canvas.width - total_dial_width) / 2;

            for (let i = 0; i < this.dial_count; i++) {
                const dial_x = start_x + i * (this.dial_radius * 2 + this.dial_spacing) + this.dial_radius;
                if (Math.abs(x - dial_x) <= this.dial_radius) {
                    this.selected_index = i;
                    break;
                }
            }

            this.draw();
        });

        $(document).on("keydown", (e) => {
            const dial = this.dials[this.selected_index];
            if (!dial) return;

            if (e.key === "a" || e.key === "ArrowLeft") {
                dial.angle = (dial.angle - 5 + 360) % 360;
            } else if (e.key === "d" || e.key === "ArrowRight") {
                dial.angle = (dial.angle + 5) % 360;
            }

            this.draw();
        });

        $("#frequency_jam_submit").on("click", () => {
            const win = this.check_win();
            this.end_game(win);
        });
    }

    check_win() {
        const tolerance = this.config.precision || 5;
        return this.dials.every((d) => {
            const diff = Math.abs(d.angle - d.target) % 360;
            return Math.min(diff, 360 - diff) <= tolerance;
        });
    }

    start_timer() {
        this.timer = setInterval(() => {
            this.remaining -= 1000;
            $(".minigame_timer").text(`Time Remaining: ${Math.floor(this.remaining / 1000)}s`);
            if (this.remaining <= 0) {
                clearInterval(this.timer);
                this.end_game(false);
            }
            if (this.remaining <= 5000) {
                $(".minigame_timer").css("color", "rgba(255,0,0,0.9)");
                this.play_sound("low_time");
            }
        }, 1000);
    }

    end_game(success) {
        clearInterval(this.timer);
        this.success = success;
        const result = success ? "SUCCESS" : "FAILED";
        const audio = success ? "success" : "failed";

        const overlay = `<div class="minigame_result_screen">${result}</div>`;
        $(".minigame_container").html(overlay);
        this.play_sound(audio);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "frequency_jam", success }));
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