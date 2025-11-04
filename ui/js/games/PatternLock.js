/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class PatternLock {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.grid_size = 3;
        this.dots = [];
        this.pattern = [];
        this.input_pattern = [];
        this.drawing = false;
        this.line_width = 10;
        this.dot_radius = 15;
        this.timer = null;
        this.remaining = 10000;
        this.success = false;
        this.showing_pattern = false;

        this.config = {
            timer: 10000,
            pattern_length: 4,
            allow_diagonals: false
        };

        this.audio = {
            success: "assets/audio/succeeded.ogg",
            failed: "assets/audio/system_fault.ogg",
            low_time: "assets/audio/beep.ogg",
            volume: 0.2
        };
    }

    init(data) {
        this.config = { ...this.config, ...data };
        this.remaining = this.config.timer;
        this.build_ui();
    }

    build_ui() {
        const content = `
            <div class="minigame_container">
                <div class="minigame_header">
                    <div class="minigame_timer">Time Remaining: ${Math.floor(this.remaining / 1000)}s</div>
                </div>
                <div class="trace_canvas_wrapper">
                    <canvas id="trace_canvas" style="width: 100%; height: 100%;"></canvas>
                </div>
            </div>
        `;
        $("#main_container").html(content);

        this.canvas = document.getElementById("trace_canvas");
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx = this.canvas.getContext("2d");

        this.generate_grid();
        this.generate_pattern();
        this.draw(true);
        this.bind_events();
        this.start_timer();
    }

    generate_grid() {
        this.dots = [];
        const spacing_x = this.canvas.width / (this.grid_size + 1);
        const spacing_y = this.canvas.height / (this.grid_size + 1);
        for (let y = 0; y < this.grid_size; y++) {
            for (let x = 0; x < this.grid_size; x++) {
                this.dots.push({
                    x: spacing_x * (x + 1),
                    y: spacing_y * (y + 1),
                    index: y * this.grid_size + x,
                    gx: x,
                    gy: y
                });
            }
        }
    }

    generate_pattern() {
        this.pattern = [];
        const used = new Set();
        let current = Math.floor(Math.random() * this.dots.length);
        this.pattern.push(current);
        used.add(current);

        while (this.pattern.length < this.config.pattern_length) {
            const next = this.get_next_valid_dot(current, used);
            if (next === -1) break;
            used.add(next);
            this.pattern.push(next);
            current = next;
        }
    }

    get_next_valid_dot(from, used) {
        const candidates = [];
        for (let i = 0; i < this.dots.length; i++) {
            if (!used.has(i) && this.is_valid_connection(from, i, used)) {
                candidates.push(i);
            }
        }
        if (candidates.length === 0) return -1;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    is_valid_connection(from, to, used) {
        if (from === to) return false;
        const gx = this.grid_size;

        const fx = from % gx;
        const fy = Math.floor(from / gx);
        const tx = to % gx;
        const ty = Math.floor(to / gx);

        const dx = tx - fx;
        const dy = ty - fy;

        if (Math.abs(dx) === 2 && dy === 0) {
            const mid = from + Math.sign(dx);
            if (!used.has(mid)) return false;
        } else if (Math.abs(dy) === 2 && dx === 0) {
            const mid = from + Math.sign(dy) * gx;
            if (!used.has(mid)) return false;
        } else if (Math.abs(dx) === 2 && Math.abs(dy) === 2) {
            const mid = from + Math.sign(dx) + Math.sign(dy) * gx;
            if (!used.has(mid)) return false;
        }

        return true;
    }

    draw(show_pattern = false) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const path = show_pattern ? this.pattern : this.input_pattern;

        if (path.length >= 2) {
            ctx.beginPath();
            const from = this.dots[path[0]];
            ctx.moveTo(from.x, from.y);
            for (let i = 1; i < path.length; i++) {
                const dot = this.dots[path[i]];
                ctx.lineTo(dot.x, dot.y);
            }

            const fallback = show_pattern ? '#b53232' : '#c08f1e';
            const css_var = getComputedStyle(document.documentElement).getPropertyValue(show_pattern ? '--accent2' : '--accent3').trim();
            ctx.strokeStyle = css_var || fallback;
            ctx.lineWidth = this.line_width;
            ctx.lineCap = "round";
            ctx.stroke();
        }

        for (const [i, dot] of this.dots.entries()) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, this.dot_radius, 0, Math.PI * 2);

            if (show_pattern && i === this.pattern[0]) {
                ctx.fillStyle =
                    getComputedStyle(document.documentElement)
                        .getPropertyValue('--accent3')
                        .trim() || '#b53232';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                const path_active = path.includes(i);
                const fill_var = path_active ? '--accent' : '--accent4';
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(fill_var).trim() || (path_active ? '#e4ad29' : '#666');
                ctx.fill();
            }
        }
    }

    bind_events() {
        this.canvas.addEventListener("mousedown", (e) => this.start_input(e));
        this.canvas.addEventListener("mousemove", (e) => this.move_input(e));
        document.addEventListener("mouseup", () => this.end_input());
    }

    get_cursor_pos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    start_input(e) {
        if (this.showing_pattern) return;
        const pos = this.get_cursor_pos(e);
        const index = this.get_dot_at(pos);
        if (index !== -1) {
            this.drawing = true;
            this.input_pattern = [index];
            this.draw();
        }
    }

    move_input(e) {
        if (!this.drawing || this.showing_pattern) return;
        const pos = this.get_cursor_pos(e);
        const index = this.get_dot_at(pos);
        const last = this.input_pattern[this.input_pattern.length - 1];

        if (index !== -1 && !this.input_pattern.includes(index)) {
            if (this.is_valid_connection(last, index, new Set(this.input_pattern))) {
                this.input_pattern.push(index);
                this.draw();
            }
        }
    }

    end_input() {
        if (!this.drawing || this.showing_pattern) return;
        this.drawing = false;

        const match =
            this.pattern.length === this.input_pattern.length &&
            this.pattern.every((v, i) => v === this.input_pattern[i]);

        this.end_game(match);
    }

    get_dot_at(pos) {
        for (const [i, dot] of this.dots.entries()) {
            const dx = pos.x - dot.x;
            const dy = pos.y - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.dot_radius * 1.5) return i;
        }
        return -1;
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

        this.showing_pattern = true;
        this.draw(true);
        setTimeout(() => {
            this.showing_pattern = false;
            this.draw(false);
        }, 1800);
    }

    end_game(success) {
        clearInterval(this.timer);
        this.success = success;
        const result = success ? "SUCCESS" : "FAILED";
        const audio = success ? "success" : "failed";

        const html = `<div class="minigame_container pulse_sync">
            <div class="minigame_result_screen">${result}</div>
        </div>`;
        $("#main_container").html(html);
        this.play_sound(audio);

        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "pattern_lock", success }));
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