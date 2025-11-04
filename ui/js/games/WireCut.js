/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class WireCut {
    constructor() {
        this.correct_wire = null;
        this.canvas = null;
        this.ctx = null;
        this.original_colors = [
            'rgb(120, 0, 0)', 'rgb(0, 88, 0)', 'rgb(0, 0, 160)',
            'rgb(160, 160, 0)', 'rgb(88, 0, 88)', 'rgb(215, 100, 0)'
        ];
        this.wire_paths = [];
        this.wires_cut = [];
        this.timer = 60;
        this.is_game_active = false;
        this.hovered_wire_index = null;

        this.remaining_chances = 1;
        this.max_chances = 1;
    }

    init(data) {
        this.timer = data.timer / 1000 || 60;
        this.max_chances = data.chances || 1;
        this.remaining_chances = this.max_chances;

        this.build_ui();
        this.start_timer();
    }

    build_ui() {
        const canvas_html = `
            <div class="wire_cut_container">
                <canvas id="wire_cut_canvas" width="300" height="265"></canvas>
                <div class="wire_cut_timer_container">
                    <div id="timer_display">${this.format_time(this.timer)}</div>
                </div>
            </div>
        `;
        $('#main_container').html(canvas_html);
        this.canvas = document.getElementById('wire_cut_canvas');
        this.ctx = this.canvas.getContext('2d');
        this.build_game_area();
    }

    start_timer() {
        this.is_game_active = true;
        this.timer_interval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
                $('#timer_display').text(this.format_time(this.timer));
            } else {
                this.game_end(false);
            }
        }, 1000);
    }

    stop_timer() {
        clearInterval(this.timer_interval);
        this.is_game_active = false;
    }

    format_time(seconds) {
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        return `00:${mm}:${ss}`;
    }

    build_game_area() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const radius = 5;
        const left_x = 30;
        const right_x = 270;
        const dist_y = 38;
        const start_y = dist_y;
        const adjusted_start_x = left_x + radius;
        const adjusted_end_x = right_x - radius;
        const right_map = this.generate_right_circles();

        this.correct_wire = Math.floor(Math.random() * 6);
        const shuffled_colors = [...this.original_colors].sort(() => Math.random() - 0.5);
        this.wire_paths = [];

        for (let i = 0; i < 6; i++) {
            const left_y = start_y + i * dist_y;
            const right_y = start_y + right_map[i] * dist_y;
            const color = shuffled_colors[i];
            const path = this.create_wire_path(adjusted_start_x, left_y, adjusted_end_x, right_y);

            this.wire_paths.push({
                path,
                index: i,
                color,
                left: { x: left_x, y: left_y },
                right: { x: right_x, y: right_y }
            });

            this.draw_wire(path, color);
        }

        for (let i = 0; i < 6; i++) {
            const y = start_y + i * dist_y;
            this.draw_circle(left_x, y, radius + 3);
            this.draw_circle(right_x, y, radius + 3);
        }

        this.canvas.addEventListener('click', (e) => this.check_wire_click(e));
        this.canvas.addEventListener('mousemove', (e) => this.handle_hover(e));
    }

    generate_right_circles() {
        let indices = [1, 2, 3, 4, 5];
        indices.sort(() => Math.random() - 0.5);
        const insert_at = Math.floor(Math.random() * indices.length);
        indices.splice(insert_at, 0, 0);
        return indices;
    }

    create_wire_path(x1, y1, x2, y2) {
        const cpx = (x1 + x2) / 2;
        const cp1y = y1 - 50;
        const cp2y = y2 - 50;
        const path = new Path2D();
        path.moveTo(x1, y1);
        path.bezierCurveTo(cpx, cp1y, cpx, cp2y, x2, y2);
        return path;
    }

    draw_wire(path, color, highlight = false) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = highlight ? '#e4ad29' : color;
        this.ctx.shadowColor = highlight ? 'rgba(228, 173, 41, 0.9)' : 'rgba(0, 0, 0, 0.6)';
        this.ctx.shadowBlur = highlight ? 10 : 4;
        this.ctx.stroke(path);
        this.ctx.restore();
    }

    draw_circle(x, y, r, highlight = false) {
        const g = this.ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
        g.addColorStop(0, highlight ? '#ffe8b0' : '#999');
        g.addColorStop(0.5, highlight ? '#e4ad29' : '#777');
        g.addColorStop(1, highlight ? '#a47414' : '#333');
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, r, 0, Math.PI * 2);
        this.ctx.fillStyle = g;
        this.ctx.shadowColor = highlight ? 'rgba(228, 173, 41, 0.9)' : 'rgba(0,0,0,0.4)';
        this.ctx.shadowBlur = highlight ? 8 : 4;
        this.ctx.fill();
        this.ctx.restore();
    }

    check_wire_click(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hit_radius = 10;

        for (const { index, left, right } of this.wire_paths) {
            if (this.wires_cut.includes(index)) continue;
            const dist_left = Math.hypot(x - left.x, y - left.y);
            const dist_right = Math.hypot(x - right.x, y - right.y);
            if (dist_left <= hit_radius || dist_right <= hit_radius) {
                this.handle_cut(index);
                break;
            }
        }
    }

    handle_hover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hit_radius = 10;
        let hovered = null;

        for (const { index, left, right } of this.wire_paths) {
            if (this.wires_cut.includes(index)) continue;
            const dist_left = Math.hypot(x - left.x, y - left.y);
            const dist_right = Math.hypot(x - right.x, y - right.y);
            if (dist_left <= hit_radius || dist_right <= hit_radius) {
                hovered = index;
                break;
            }
        }

        if (this.hovered_wire_index !== hovered) {
            this.hovered_wire_index = hovered;
            this.redraw();
        }
    }

    handle_cut(index) {
        if (this.wires_cut.includes(index)) return;
        this.wires_cut.push(index);
        this.hovered_wire_index = null;
        this.redraw();

        if (index === this.correct_wire) {
            this.game_end(true);
        } else {
            const fail_sound = new Audio(`assets/audio/system_fault.ogg`);
            fail_sound.volume = 0.2;
            fail_sound.play();

            this.remaining_chances--;
            if (this.remaining_chances <= 0) {
                this.game_end(false);
            }
        }
    }


    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const { path, color, index } of this.wire_paths) {
            if (!this.wires_cut.includes(index)) {
                const is_hovered = index === this.hovered_wire_index;
                this.draw_wire(path, color, is_hovered);
            }
        }

        for (const { index, left, right } of this.wire_paths) {
            const is_hovered = index === this.hovered_wire_index;
            if (!this.wires_cut.includes(index)) {
                this.draw_circle(left.x, left.y, 8, is_hovered);
                this.draw_circle(right.x, right.y, 8, is_hovered);
            }
        }
    }

    game_end(success) {
        this.stop_timer();
        const result = success ? 'success' : 'failed';
        const sound = new Audio(`assets/audio/${result === 'success' ? 'succeeded' : 'system_fault'}.ogg`);
        sound.volume = 0.2;
        sound.play();
        setTimeout(() => {
            $('#main_container').empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "wire_cut", success }));
        }, 500);
    }
}