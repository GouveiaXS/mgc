/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class CircuitTrace {
    constructor() {
        this.time_limit = 15000;
        this.line_width = 20;
        this.path = [];
        this.trace_path = [];
        this.trace_progress = 0;
        this.success = false;
        this.timer = null;
        this.remaining = this.time_limit;
        this.is_drawing = false;
        this.canvas = null;
        this.ctx = null;

        this.audio = {
            success: "assets/audio/succeeded.ogg",
            failed: "assets/audio/system_fault.ogg",
            low_time: "assets/audio/beep.ogg",
            volume: 0.2
        };
    }

    init(data) {
        this.time_limit = data?.timer || 15000;
        this.remaining = this.time_limit;
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
        this.ctx = this.canvas.getContext("2d");

        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.setup_path();
        this.draw_path();
        this.bind_events();
        this.start_timer();
    }


    setup_path() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        const grid_cols = 8;
        const grid_rows = 8;

        const margin = this.line_width + 12;
        const cell_w = (w - margin * 2) / grid_cols;
        const cell_h = (h - margin * 2) / grid_rows;

        const start = { col: 0, row: 0 };
        const end = { col: grid_cols - 1, row: grid_rows - 1 };

        let current = { ...start };
        const visited = new Set();
        visited.add(`${current.col},${current.row}`);

        const path = [this.grid_to_px(current, cell_w, cell_h, margin)];

        while (current.col !== end.col || current.row !== end.row) {
            const moves = [];

            if (current.col < end.col) moves.push({ col: current.col + 1, row: current.row });
            if (current.row < end.row) moves.push({ col: current.col, row: current.row + 1 });
            if (current.row > 0) moves.push({ col: current.col, row: current.row - 1 });

            for (let i = moves.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [moves[i], moves[j]] = [moves[j], moves[i]];
            }

            let moved = false;
            for (const move of moves) {
                const key = `${move.col},${move.row}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    current = move;
                    path.push(this.grid_to_px(current, cell_w, cell_h, margin));
                    moved = true;
                    break;
                }
            }

            if (!moved) break;
        }

        this.path = path;
    }

    grid_to_px(cell, cell_w, cell_h, margin) {
        return {
            x: margin + cell.col * cell_w + cell_w / 2,
            y: margin + cell.row * cell_h + cell_h / 2
        };
    }

    draw_path() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.beginPath();
        ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e4ad29';
        ctx.lineWidth = this.line_width;
        ctx.lineCap = "butt";
        ctx.stroke();

        const start = this.path[0];
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent3').trim() || '#b53232';
        ctx.fillRect(start.x - this.line_width / 2, start.y - this.line_width / 2, this.line_width, this.line_width);

        const end = this.path[this.path.length - 1];
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent4').trim() || '#666';
        ctx.fillRect(end.x - this.line_width / 2, end.y - this.line_width / 2, this.line_width, this.line_width);
    }

    draw_trace() {
        const ctx = this.ctx;
        if (this.trace_path.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.trace_path[0].x, this.trace_path[0].y);
        for (let i = 1; i < this.trace_path.length; i++) {
            ctx.lineTo(this.trace_path[i].x, this.trace_path[i].y);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = this.line_width / 2;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    bind_events() {
        this.canvas.addEventListener("mousedown", (e) => this.start_trace(e));
        this.canvas.addEventListener("mousemove", (e) => this.trace_move(e));
        document.addEventListener("mouseup", (e) => this.handle_release(e));
    }

    get_cursor_pos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    rand_between(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    start_trace(e) {
        const pos = this.get_cursor_pos(e);
        const start = this.path[0];
        const dx = pos.x - start.x;
        const dy = pos.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= this.line_width) {
            this.is_drawing = true;
            this.trace_path = [pos];
            this.trace_progress = 0;
        }
    }

    trace_move(e) {
        if (!this.is_drawing || this.success) return;

        const pos = this.get_cursor_pos(e);
        this.trace_path.push(pos);
        this.draw_path();
        this.draw_trace();

        let on_path = false;

        for (let i = 0; i < this.path.length - 1; i++) {
            const p1 = this.path[i];
            const p2 = this.path[i + 1];
            const dist = this.point_to_seg(pos, p1, p2);
            if (dist <= this.line_width / 3) {
                on_path = true;
                this.trace_progress = i + 1;
                break;
            }
        }

        if (!on_path) {
            this.end_game(false);
        }

        const end = this.path[this.path.length - 1];
        const dx = pos.x - end.x;
        const dy = pos.y - end.y;
        const distEnd = Math.sqrt(dx * dx + dy * dy);

        if (distEnd <= this.line_width) {
            this.success = true;
            this.end_game(true);
        }
    }

    handle_release() {
        if (this.is_drawing && !this.success) {
            this.end_game(false);
        }
        this.is_drawing = false;
    }

    point_to_seg(p, a, b) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
        const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
        const clampedT = Math.max(0, Math.min(1, t));
        const closest = { x: a.x + clampedT * dx, y: a.y + clampedT * dy };
        return Math.hypot(p.x - closest.x, p.y - closest.y);
    }

    start_timer() {
        this.timer = setInterval(() => {
            this.remaining -= 1000;
            $(".minigame_timer").text(`Time Remaining:  ${Math.floor(this.remaining / 1000)}s`);
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
        this.is_drawing = false;
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
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "circuit_trace", success }));
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
