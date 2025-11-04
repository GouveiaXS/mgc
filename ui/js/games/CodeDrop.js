/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class CodeDrop {
    constructor() {
        this.config = {
            canvas_width: 400,
            canvas_height: 300,
            bit_speed: 2,
            spawn_interval: 800,
            collector_width: 50,
            collector_height: 8,
            target_score: 10,
            max_misses: 5
        };

        this.canvas = null;
        this.ctx = null;
        this.collector = { x: 160, y: 260 };
        this.bits = [];
        this.score = 0;
        this.misses = 0;
        this.spawn_interval_id = null;
        this.animation_id = null;
        this.keys = {};
        this.ended = false;
    }

    async init(data) {
        this.config = { ...this.config, ...data };
        this.build_ui();
        this.bind_keys();
        this.start_spawning();
        this.animate();
    }

    build_ui() {
        const html = `
            <div class="minigame_container code_drop">
                <div class="minigame_header">
                    <div class="minigame_timer">
                        Score: <span id="code_drop_score">0</span> / ${this.config.target_score} |
                        Misses: <span id="code_drop_misses">0</span> / ${this.config.max_misses}
                    </div>
                </div>

                <canvas id="code_drop_canvas" width="${this.config.canvas_width}" height="${this.config.canvas_height}"></canvas>

                <div class="minigame_instructions" style="font-size: 1.2rem;">
                    Catch <span style="color:#4caf50">1s</span> and avoid <span style="color:#e64a19">0s</span> (← →)
                </div>
            </div>
        `;
        $("#main_container").html(html);

        this.canvas = document.getElementById("code_drop_canvas");
        this.ctx = this.canvas.getContext("2d");
    }

    bind_keys() {
        $(document).on("keydown.code_drop", (e) => (this.keys[e.key] = true));
        $(document).on("keyup.code_drop", (e) => (this.keys[e.key] = false));
    }

    start_spawning() {
        clearInterval(this.spawn_interval_id);
        this.spawn_interval_id = setInterval(() => {
            if (!this.ended) this.spawn_bit();
        }, this.config.spawn_interval);
    }

    spawn_bit() {
        const bit = { x: Math.random() * (this.config.canvas_width - 20), y: -10, value: Math.random() < 0.5 ? 0 : 1 };
        this.bits.push(bit);
    }

    move_collector() {
        const speed = 3;
        if (this.keys["ArrowLeft"]) this.collector.x -= speed;
        if (this.keys["ArrowRight"]) this.collector.x += speed;
        this.collector.x = Math.max(0, Math.min(this.collector.x, this.config.canvas_width - this.config.collector_width));
    }

    update_bits() {
        for (let i = this.bits.length - 1; i >= 0; i--) {
            const bit = this.bits[i];
            bit.y += this.config.bit_speed;

            if (
                bit.y >= this.collector.y - this.config.collector_height &&
                bit.x >= this.collector.x &&
                bit.x <= this.collector.x + this.config.collector_width
            ) {
                if (bit.value === 1) this.score++;
                else this.misses++;
                this.bits.splice(i, 1);
                continue;
            }

            if (bit.y > this.config.canvas_height) {
                if (bit.value === 1) this.misses++;
                this.bits.splice(i, 1);
            }
        }

        $("#code_drop_score").text(this.score);
        $("#code_drop_misses").text(this.misses);

        if (this.score >= this.config.target_score) this.check_match(true);
        if (this.misses >= this.config.max_misses) this.check_match(false);
    }

    draw_collector() {
        const ctx = this.ctx;
        ctx.fillStyle = "#e4ad29";
        ctx.fillRect(this.collector.x, this.collector.y, this.config.collector_width, this.config.collector_height);
    }

    draw_bits() {
        const ctx = this.ctx;
        ctx.font = "1.2rem VT323, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (const bit of this.bits) {
            ctx.fillStyle = bit.value === 1 ? "#4caf50" : "#e64a19";
            ctx.fillText(bit.value.toString(), bit.x + 10, bit.y + 10);
        }
    }

    animate() {
        if (this.ended) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.move_collector();
        this.update_bits();
        this.draw_bits();
        this.draw_collector();

        this.animation_id = requestAnimationFrame(() => this.animate());
    }

    check_match(forceSuccess) {
        if (this.ended) return;
        this.ended = true;

        cancelAnimationFrame(this.animation_id);
        clearInterval(this.spawn_interval_id);
        $(document).off("keydown.code_drop keyup.code_drop");

        const success = !!forceSuccess || (this.score >= this.config.target_score && this.misses < this.config.max_misses);
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
            try {
                $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "anagram", success }));
            } catch (err) {
                console.warn("Could not send code_drop_end callback:", err);
            }
        }, 2000);
    }
}