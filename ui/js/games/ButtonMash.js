/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class ButtonMash {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.center = { x: 0, y: 0 };
        this.current_key = '';
        this.notch_length = 0;
        this.target_notch_length = Math.PI * 2;
        this.difficulty = null;
        this.notch_increment = null;
        this.notch_decrement = null;
        this.decrement_interval = null;
        this.is_key_active = null;
        this.game_active = true;

        this.audio = {
            success: 'assets/audio/glitchy.ogg',
            failed: 'assets/audio/system_fault.ogg',
            volume: 0.1
        };
    }

    init(data) {
        this.difficulty = data.difficulty || 1;
        this.notch_increment = this.calculate_notch_increment(this.difficulty);
        this.notch_decrement = this.notch_increment / 2.5;
        this.build_ui();
        this.bind_key_press_events();
        this.choose_random_key();
    }

    calculate_notch_increment(difficulty) {
        const base_increment = Math.PI / 10;
        return base_increment / difficulty;
    }

    build_ui() {
        const content = `
            <div class="button_mash_container">
                <canvas id="button_mash_canvas" width="300" height="300"></canvas>
                <span class="button_mash_info">TAP</span>
                <div class="current_key_display"></div>
            </div>
        `;
        $('#main_container').html(content);
        this.canvas = document.getElementById('button_mash_canvas');
        this.ctx = this.canvas.getContext('2d');
        this.center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.draw_ring();
    }

    bind_key_press_events() {
        document.addEventListener('keyup', (e) => {
            if (e.key.toUpperCase() === this.current_key) {
                if (!this.is_key_active) {
                    this.is_key_active = true;
                    clearInterval(this.decrement_interval);
                }
                this.increase_notch();
            }
        });
        document.addEventListener('keyup', (e) => {
            if (e.key.toUpperCase() === this.current_key) {
                this.is_key_active = false;
                this.start_decrement_interval();
            }
        });
    }

    start_decrement_interval() {
        this.decrement_interval = setInterval(() => {
            if (!this.is_key_active) {
                this.decrease_notch();
                if (this.notch_length <= 0) {
                    clearInterval(this.decrement_interval);
                    this.game_end(false);
                }
            }
        }, 100);
    }

    choose_random_key() {
        const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        this.current_key = keys[Math.floor(Math.random() * keys.length)];
        $('.current_key_display').text(`${this.current_key}`);
    }

    draw_ring() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, 100, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'transparent';
        this.ctx.lineWidth = 35;
        this.ctx.stroke();

        const gradient = this.ctx.createConicGradient(0, this.center.x, this.center.y);
        gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
        gradient.addColorStop(0.33, "rgba(255, 128, 0, 1)");
        gradient.addColorStop(0.66, "rgba(255, 255, 0, 1)");
        gradient.addColorStop(1, "rgba(0, 255, 0, 1)");

        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, 100, 0, this.notch_length);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 35;
        this.ctx.shadowColor = "rgba(0, 0, 0, 1)";
        this.ctx.shadowBlur = 3;
        this.ctx.stroke();
    }

    increase_notch() {
        if (this.game_active && this.notch_length < this.target_notch_length) {
            this.notch_length += this.notch_increment;
            this.draw_ring();
            if (this.notch_length >= this.target_notch_length) {
                this.game_end(true);
            }
        }
    }

    decrease_notch() {
        if (this.game_active && this.notch_length > 0) {
            this.notch_length -= this.notch_decrement;
            this.notch_length = Math.max(this.notch_length, 0);
            this.draw_ring();
            if (this.notch_length <= 0) {
                this.game_end(false);
            }
        }
    }

    game_end(success) {
        if (this.game_active) {
            this.game_active = false;
            clearInterval(this.decrement_interval);
            this.play_sound(success ? 'success' : 'failed');
            setTimeout(() => {
                $('#main_container').empty();
                $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "button_mash", success }));
            }, 1500);
        }
    }

    play_sound(key) {
        const src = this.audio[key];
        if (src) {
            const sound = new Audio(src);
            sound.volume = this.audio.volume;
            sound.play();
        }
    }
}