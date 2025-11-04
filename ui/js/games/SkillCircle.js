/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class SkillCircle {
    constructor() {
        this.icon_class = "fa-solid fa-fish";
        this.audio = {
            success: "/ui/assets/audio/beep.ogg",
            failed: "/ui/assets/audio/system_fault.ogg",
            volume: 0.3
        };

        this.current_key = '';
        this.radius = 100;
        this.circle_width = 300;
        this.circle_height = 300;
        this.icon_angle = 0;
        this.target_zone_angle = 0;
        this.speed = 0.6;
        this.area_size = Math.PI / 3;
        this.game_active = true;

        this.theme = document.querySelector('body.default');
        this.accent_colour = getComputedStyle(this.theme).getPropertyValue('--accent').trim();
        this.bg_colour = getComputedStyle(this.theme).getPropertyValue('--background_main').trim();
    }

    init(data) {
        this.icon_class = data.icon || this.icon_class;
        this.speed = data.speed || this.speed;
        this.area_size = Math.PI / (data.area_size || 3);

        this.icon_angle = Math.random() * Math.PI * 2;
        this.target_zone_angle = Math.random() * Math.PI * 2;

        this.build_ui();
        this.animate();
        this.choose_random_key();
        this.bind_key_events();
    }

    build_ui() {
        const icon_html = `<i class="${this.icon_class}" aria-hidden="true"></i>`;
        const content = `
            <div class="skill_circle_container">
                <canvas id="skill_circle_canvas" width="${this.circle_width}" height="${this.circle_height}"></canvas>
                <div class="skill_circle_icon">${icon_html}</div>
                <div class="current_key_display"></div>
            </div>
        `;
        $('#main_container').html(content);
        this.canvas = document.getElementById('skill_circle_canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    choose_random_key() {
        const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.current_key = keys[Math.floor(Math.random() * keys.length)];
        $('.current_key_display').text(`${this.current_key}`);
    }

    draw_circle() {
        this.ctx.clearRect(0, 0, this.circle_width, this.circle_height);

        const cx = this.circle_width / 2;
        const cy = this.circle_height / 2;
        const rw = 40;

        this.ctx.beginPath();
        this.ctx.lineWidth = rw;
        this.ctx.strokeStyle = this.bg_colour;
        this.ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.accent_colour;
        this.ctx.arc(cx, cy, this.radius + rw / 2, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.accent_colour;
        this.ctx.arc(cx, cy, this.radius - rw / 2, 0, Math.PI * 2);
        this.ctx.stroke();

        const start = this.target_zone_angle;
        const end = this.target_zone_angle + this.area_size;

        this.ctx.beginPath();
        this.ctx.lineWidth = rw;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.arc(cx, cy, this.radius, start, end);
        this.ctx.stroke();

        const target_center = this.target_zone_angle + this.area_size / 2;
        const perfect_start_x = cx + (this.radius - 20) * Math.cos(target_center);
        const perfect_start_y = cy + (this.radius - 20) * Math.sin(target_center);
        const perfect_end_x = cx + (this.radius + 20) * Math.cos(target_center);
        const perfect_end_y = cy + (this.radius + 20) * Math.sin(target_center);

        this.ctx.beginPath();
        this.ctx.moveTo(perfect_start_x, perfect_start_y);
        this.ctx.lineTo(perfect_end_x, perfect_end_y);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();

        this.set_icon_position();
    }

    set_icon_position() {
        const iconX = this.circle_width / 2 + this.radius * Math.cos(this.icon_angle);
        const iconY = this.circle_height / 2 + this.radius * Math.sin(this.icon_angle);
        $('.skill_circle_icon').css({ left: `${iconX}px`, top: `${iconY}px` });
    }

    bind_key_events() {
        $(document).off('keydown').on('keydown', (e) => {
            if (e.key.toUpperCase() === this.current_key && this.game_active) {
                this.game_active = false;
                this.check_position();
            }
        });
    }

    check_position() {
        const tolerance = 1.0 * (Math.PI / 180);
        const target_start = this.target_zone_angle - tolerance;
        const target_end = this.target_zone_angle + this.area_size + tolerance;

        if (this.icon_angle >= target_start && this.icon_angle <= target_end) {
            this.game_end("success");
        } else {
            this.game_end("failed");
        }
    }

    game_end(success) {
        this.play_sound(success);
        setTimeout(() => {
            $('#main_container').empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "skill_circle", success }));
        }, 1500);
    }

    play_sound(key) {
        const path = this.audio[key];
        if (!path) return;
        const sound = new Audio(path);
        sound.volume = this.audio.volume;
        sound.play();
    }

    animate(last_time = performance.now()) {
        if (!this.game_active) return;

        const now = performance.now();
        const delta = (now - last_time) / 1000;

        this.target_zone_angle += this.speed * delta * 60;
        if (this.target_zone_angle > Math.PI * 2) {
            this.target_zone_angle -= Math.PI * 2;
        }

        this.draw_circle();
        requestAnimationFrame((new_time) => this.animate(new_time));
    }
}