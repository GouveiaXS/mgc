/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class SignalWave {
    constructor() {
        this.config = {
            match_threshold: 0.1,
            adjust_step: 0.05,
            wave_length: 200,
            amplitude_range: [0.5, 2.0],
            frequency_range: [0.5, 2.0],
            canvas_width: 400,
            canvas_height: 300,
            total_time: 20
        };

        this.canvas = null;
        this.ctx = null;
        this.target_wave = [];
        this.user_wave = [];
        this.frequency = 1.0;
        this.amplitude = 1.0;
        this.animation_id = null;
        this.timer_interval = null;
        this.time_remaining = this.config.total_time;
    }

    async init(data) {
        this.config = { ...this.config, ...data };
        this.time_remaining = this.config.total_time;
        this.build_ui();
        this.generate_target_wave();
        this.bind_keys();
        this.start_timer();
        this.animate();
    }

    build_ui() {
        const html = `
            <div class="minigame_container signal_wave">
                <div class="minigame_header">
                    <div class="minigame_timer">
                        Time Remaining: <span id="signal_timer">${this.time_remaining}s</span>
                    </div>
                </div>

                <canvas id="signal_wave_canvas" width="${this.config.canvas_width}" height="${this.config.canvas_height}"></canvas>

                <div class="minigame_instructions" style="font-size: 1.2rem;">
                    Match frequency (← →) and amplitude (↓ ↑)
                </div>

                <button id="signal_submit" class="signal_submit_btn">SUBMIT</button>
            </div>
        `;
        $("#main_container").html(html);
        this.canvas = document.getElementById("signal_wave_canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    bind_keys() {
        $(document).on("keydown.signal_wave", (e) => {
            if (e.key === "ArrowLeft")
                this.frequency = Math.max(this.config.frequency_range[0], this.frequency - this.config.adjust_step);
            if (e.key === "ArrowRight")
                this.frequency = Math.min(this.config.frequency_range[1], this.frequency + this.config.adjust_step);
            if (e.key === "ArrowUp")
                this.amplitude = Math.min(this.config.amplitude_range[1], this.amplitude + this.config.adjust_step);
            if (e.key === "ArrowDown")
                this.amplitude = Math.max(this.config.amplitude_range[0], this.amplitude - this.config.adjust_step);
        });

        $("#signal_submit").on("click", () => this.check_match());
    }

    start_timer() {
        clearInterval(this.timer_interval);
        this.timer_interval = setInterval(() => {
            this.time_remaining--;
            $("#signal_timer").text(`${this.time_remaining}s`);
            if (this.time_remaining <= 0) {
                clearInterval(this.timer_interval);
                this.check_match();
            }
        }, 1000);
    }

    generate_target_wave() {
        const { wave_length } = this.config;
        const freq = Math.random() * 1.5 + 0.5;
        const amp = Math.random() * 1.0 + 0.5;

        this.target_wave = [];
        for (let i = 0; i <= wave_length; i++) {
            const y = amp * Math.sin((i / wave_length) * Math.PI * 2 * freq);
            this.target_wave.push({ x: i, y });
        }
    }

    generate_user_wave() {
        const { wave_length } = this.config;
        this.user_wave = [];
        for (let i = 0; i <= wave_length; i++) {
            const y = this.amplitude * Math.sin((i / wave_length) * Math.PI * 2 * this.frequency);
            this.user_wave.push({ x: i, y });
        }
    }

    draw_wave(wave, color, offset_y) {
        const ctx = this.ctx;
        const { canvas_width, canvas_height } = this.config;

        const maxAmp = this.config.amplitude_range[1];
        const verticalMargin = 10;
        const verticalScale = (canvas_height / 4 - verticalMargin) / maxAmp;

        const cycles = wave === this.target_wave ? this.target_freq : this.frequency;
        const effectiveCycles = cycles || this.frequency;
        const totalCycles = Math.max(1, effectiveCycles);
        const horizontalScale = canvas_width / (wave.length / totalCycles);

        const center_y = offset_y;
        ctx.beginPath();
        for (let i = 0; i < wave.length; i++) {
            const px = (i / wave.length) * canvas_width;
            const py = center_y - wave[i].y * verticalScale;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    animate() {
        this.generate_user_wave();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const topY = this.canvas.height / 4;
        const bottomY = (this.canvas.height * 3) / 4;

        this.draw_wave(this.target_wave, "#4caf50", topY);
        this.draw_wave(this.user_wave, "#e4ad29", bottomY);

        this.animation_id = requestAnimationFrame(() => this.animate());
    }

    check_match() {
        this.generate_user_wave();
        let error_sum = 0;
        for (let i = 0; i < this.target_wave.length; i++) {
            const dy = this.target_wave[i].y - this.user_wave[i].y;
            error_sum += dy * dy;
        }
        const rms_error = Math.sqrt(error_sum / this.target_wave.length);

        cancelAnimationFrame(this.animation_id);
        $(document).off("keydown.signal_wave");
        clearInterval(this.timer_interval);

        const success = rms_error <= this.config.match_threshold;
        this.show_result(success);
    }

    show_result(success) {
        const result = success ? "SUCCESS" : "FAILED";
        const html = `<div class="minigame_container pulse_sync">
            <div class="minigame_result_screen">${result}</div>
        </div>`;
        $("#main_container").html(html);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "signal_wave", success }));
        }, 2000);
    }
}
