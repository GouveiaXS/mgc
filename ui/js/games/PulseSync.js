/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class PulseSync {
    constructor() {
        this.config = {
            rounds: 5,
            zone_width: 40,
            delay_between: 1000,
            pulse_duration: 3500,
            easing: "ease_out_quad"
        };

        this.round = 0;
        this.successes = 0;
        this.start_time = null;
        this.target_radius = 100;
        this.running = false;
        this.canvas = null;
        this.ctx = null;
        this.raf = null;
        this.cd_ele = null;
    }

    async init(data) {
        this.config = { ...this.config, ...data };
        this.build_ui();
        this.next_round();
    }

    build_ui() {
        const html = `
            <div class="minigame_container pulse_sync">
                <div class="minigame_header">
                    <div class="minigame_timer">Round <span id="pulse_round">1</span> / ${this.config.rounds}</div>
                </div>
                <div class="pulse_sync_canvas_wrapper">
                    <canvas id="pulse_sync_canvas"></canvas>
                    <div id="pulse_sync_countdown" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                        font-size: 4rem; color: white; font-family: 'VT323', monospace;"></div>
                </div>
                <button class="pulse_sync_button" id="pulse_sync_submit">SYNC</button>
            </div>
        `;

        $("#main_container").html(html);

        this.canvas = document.getElementById("pulse_sync_canvas");
        this.canvas.width = 300;
        this.canvas.height = 300;
        this.ctx = this.canvas.getContext("2d");

        this.cd_ele = document.getElementById("pulse_sync_countdown");

        document.getElementById("pulse_sync_submit").addEventListener("click", () => this.check_hit());
    }

    next_round() {
        if (this.round >= this.config.rounds) {
            this.end_game(this.successes === this.config.rounds);
            return;
        }

        this.round++;
        $("#pulse_round").text(this.round);
        this.running = false;
        this.start_time = null;

        this.do_countdown(() => {
            this.start_time = performance.now();
            this.running = true;
            this.animate();
        });
    }

    do_countdown(callback) {
        let count = 3;
        this.cd_ele.textContent = count;
        const interval = setInterval(() => {
            count--;
            if (count <= 0) {
                clearInterval(interval);
                this.cd_ele.textContent = "";
                callback();
            } else {
                this.cd_ele.textContent = count;
            }
        }, 1000);
    }

    ease_out_quad(t) {
        return t * (2 - t);
    }

    animate() {
        if (!this.running || !this.start_time) return;

        const now = performance.now();
        const elapsed = now - this.start_time;
        const progress = Math.min(elapsed / this.config.pulse_duration, 1);
        const eased = this.ease_out_quad(progress);
        const radius = eased * (this.canvas.width / 2);
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        const zone_half = this.config.zone_width / 2;
        const zone_min = this.target_radius - zone_half;
        const zone_max = this.target_radius + zone_half;
        const in_zone = radius >= zone_min && radius <= zone_max;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, zone_max, 0, Math.PI * 2);
        this.ctx.arc(cx, cy, zone_min, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fillStyle = "rgba(255,255,255,0.1)";
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = in_zone ? "#4caf50" : "#e4ad29";
        this.ctx.lineWidth = 5;
        this.ctx.stroke();

        if (progress >= 1) {
            this.running = false;
            this.flash_feedback(false);
            setTimeout(() => this.next_round(), 1500);
            return;
        }

        this.raf = requestAnimationFrame(() => this.animate());
    }


    check_hit() {
        if (!this.running || !this.start_time) return;

        const now = performance.now();
        const elapsed = now - this.start_time;
        const progress = elapsed / this.config.pulse_duration;
        const eased = this.ease_out_quad(progress);
        const radius = eased * (this.canvas.width / 2);

        const zone_half = this.config.zone_width / 2;
        const zone_min = this.target_radius - zone_half;
        const zone_max = this.target_radius + zone_half;

        const hit = radius >= zone_min && radius <= zone_max;

        if (hit) {
            this.successes++;
            this.flash_feedback(true);
        } else {
            this.flash_feedback(false);
        }

        this.running = false;
        cancelAnimationFrame(this.raf);
        setTimeout(() => this.next_round(), 1500);
    }

    flash_feedback(success) {
        const color = success ? "#4caf50" : "#f44336";
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.25;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    end_game(success) {
        const result = success ? "SUCCESS" : "FAILED";
        const html = `<div class="minigame_container pulse_sync"><div class="minigame_result_screen">${result}</div></div>`;
        $("#main_container").html(html);
        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "pulse_sync", success }));
        }, 2000);
    }
}