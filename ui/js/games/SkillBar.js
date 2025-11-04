/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class SkillBar {
    constructor() {
        this.icon_class = "fa-solid fa-fish";
        this.audio = {
            success: "assets/audio/beep.ogg",
            failed: "assets/audio/system_fault.ogg",
            volume: 0.2
        };

        this.area_size = 20;
        this.speed = 0.5;
        this.icon_speed = 3;
        this.orientation = 1;
        this.moving_icon = false;

        this.target_area_position = 0;
        this.icon_position = 0;
        this.moving_forward = true;
        this.game_active = true;
    }

    init(data) {
        this.icon_class = data.icon || this.icon_class;
        this.area_size = data.area_size || this.area_size;
        this.speed = data.speed || this.speed;
        this.icon_speed = data.icon_speed || this.icon_speed;
        this.orientation = data.orientation || 1;
        this.moving_icon = data.moving_icon || false;

        this.build_ui();
        this.randomise_positions();
        this.start_time = performance.now();
        requestAnimationFrame(this.update.bind(this));
        this.bind_key_events();
    }

    build_ui() {
        const orientation_style =
            this.orientation === 2 ? "transform: rotate(-90deg); top: 0%; left: 30%;" : "";

        const icon_orientation = this.orientation === 2 ? "fa-rotate-90" : "";
        const icon_html = `<i class="${this.icon_class} ${icon_orientation}" aria-hidden="true"></i>`;

        const content = `
            <div class="skill_bar_container" style="${orientation_style}">
                <div class="skill_bar_icon">${icon_html}</div>
                <div class="skill_bar_target_area" style="width: ${this.area_size}%; left: 0%;">
                    <div class="skill_bar_perfect_line" style="position:absolute;left:50%;top:0;height:100%;width:2px;background:red;transform:translateX(-50%);"></div>
                </div>
            </div>
        `;

        $("#main_container").html(content);
        this.icon_el = $(".skill_bar_icon");
        this.target_area = $(".skill_bar_target_area");
    }

    randomise_positions() {
        this.target_area_position = Math.random() * (100 - this.area_size);
        this.icon_position = Math.random() * (100 - this.area_size);
        this.icon_el.css("left", this.icon_position + "%");
        this.target_area.css("width", this.area_size + "%");
        this.target_area.css("left", this.target_area_position + "%");
    }

    clamp_icon_position() {
        const container_width = $(".skill_bar_container").width();
        const icon_width = this.icon_el.outerWidth();
        const icon_width_percent = (icon_width / container_width) * 100;
        const max = 100 - icon_width_percent;

        if (this.icon_position < 0) this.icon_position = 0;
        if (this.icon_position > max) this.icon_position = max;
    }

    update(timestamp) {
        if (!this.game_active) return;

        const dt = (timestamp - this.start_time) / 1000;
        this.start_time = timestamp;

        const delta = this.speed * dt * 60;
        if (this.moving_forward) {
            this.target_area_position += delta;
            if (this.target_area_position >= 100 - this.area_size) {
                this.target_area_position = 100 - this.area_size;
                this.moving_forward = false;
            }
        } else {
            this.target_area_position -= delta;
            if (this.target_area_position <= 0) {
                this.target_area_position = 0;
                this.moving_forward = true;
            }
        }
        this.target_area.css("left", this.target_area_position + "%");

        if (this.moving_icon) {
            const diff = this.target_area_position - this.icon_position;
            this.icon_position += (diff * this.icon_speed * dt) / 10;

            this.clamp_icon_position();
            this.icon_el.css("left", this.icon_position + "%");
        }

        requestAnimationFrame(this.update.bind(this));
    }

    bind_key_events() {
        $(document).off("keydown").on("keydown", (e) => {
            if (e.key === " " && this.game_active) {
                this.game_active = false;
                this.check_position();
            }
        });
    }

    check_position() {
        const container_width = $(".skill_bar_container").width();
        const icon_pos = (parseFloat(this.icon_el.css("left")) / container_width) * 100;
        const target_pos = this.target_area_position;
        const target_width = this.area_size;

        if (icon_pos >= target_pos && icon_pos <= target_pos + target_width) {
            this.game_end("success");
        } else {
            this.game_end("failed");
        }
    }

    game_end(success) {
        this.play_sound(success);
        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "skill_bar", success }));
        }, 1500);
    }

    play_sound(key) {
        const path = this.audio[key];
        if (!path) return;
        const sound = new Audio(path);
        sound.volume = this.audio.volume;
        sound.play();
    }
}