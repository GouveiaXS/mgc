/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class SafeCrack {
    constructor() {
        this.difficulty = null;
        this.rings = [];
        this.canvas = null;
        this.ctx = null;
        this.center = { x: 0, y: 0 };
        this.selected_ring_index = 0;
        this.initial_direction = Math.random() < 0.5 ? "left" : "right";

        this.audio = {
            rotate_left: "/ui/assets/audio/safe_lock_1.mp3",
            rotate_right: "/ui/assets/audio/safe_lock_2.mp3",
            aligned: "/ui/assets/audio/safe_lock_4.mp3",
            success: "/ui/assets/audio/succeeded.ogg",
            failed: "/ui/assets/audio/system_fault.ogg",
            volume: 0.2,
            aligned_volume: 0.8
        };
    }

    init(data) {
        this.difficulty = data.difficulty || 3;

        $(document).ready(() => {
            $(document).keyup((e) => this.handle_exit(e));
        });

        this.build_ui();
        this.setup_rings();
        this.selected_ring_index = this.rings.length - 1;
        this.draw_rings();
        this.bind_key_presses();
    }

    handle_exit(e) {
        if (e.key === "Escape" || e.key === "Backspace") {
            this.game_end(false);
        }
    }

    bind_key_presses() {
        $(document).on("keydown", (event) => {
            event.preventDefault();

            this.selected_ring_index = this.rings.findIndex(ring => !ring.notch_aligned);
            if (this.selected_ring_index === -1) return;

            const index = this.selected_ring_index;
            const rotation_step = 0.1;
            const direction = index % 2 === 0 ? this.initial_direction : (this.initial_direction === "left" ? "right" : "left");
            const direction_key = direction === "left" ? "ArrowLeft" : "ArrowRight";

            if (event.key === direction_key) {
                const delta = direction === "left" ? -rotation_step : rotation_step;
                this.rotate_ring(index, delta);
                this.play_sound(direction === "left" ? "rotate_left" : "rotate_right");
            }

            if (event.key === " ") {
                if (index !== -1) {
                    this.update_notch_alignment(index);
                    const lock_icon = $(`#lock_icon_${index}`);
                    lock_icon.toggleClass("fa-lock-open", this.rings[index].notch_aligned).toggleClass("fa-lock", !this.rings[index].notch_aligned);
                    lock_icon.css("color", this.rings[index].notch_aligned ? "var(--accent)" : "rgba(180, 180, 180, 0.25)");

                    if (this.rings[index].notch_aligned) {
                        this.selected_ring_index = this.rings.findIndex((r, i) => !r.notch_aligned && i > index);
                        const next_direction = this.selected_ring_index % 2 === 0 ? "fa-arrow-right" : "fa-arrow-left";
                        $("#direction_arrow").removeClass().addClass(`fas ${next_direction}`);
                        if (this.selected_ring_index === -1) {
                            this.check_completion();
                        }
                    }
                }
            }
        });
    }

    build_ui() {
        let audio_elements = "";
        for (let key in this.audio) {
            if (["volume", "aligned_volume"].includes(key)) continue;
            audio_elements += `<audio id="${key}_sound" src="${this.audio[key]}" preload="auto"></audio>`;
        }

        let lock_icons = "";
        for (let i = 0; i < this.difficulty; i++) {
            lock_icons += `<i class="fas fa-lock" id="lock_icon_${i}"></i><br>`;
        }

        const content = `
            <div class="sc_container">
                <canvas id="sc_canvas" width="1000" height="1000"></canvas>
                <div class="sc_lock_container">
                    <div class="sc_dial"></div>
                    <div class="sc_dial_center"></div>
                </div>
                <div class="lock_icons_container">
                    <div class="lock_icons">${lock_icons}</div>
                </div>
            </div>
            ${audio_elements}
        `;

        $("#main_container").html(content);
        this.canvas = document.getElementById("sc_canvas");
        this.ctx = this.canvas.getContext("2d");
        this.center = { x: 500, y: this.canvas.height / 2 };

        const sc_dial = document.querySelector(".sc_dial");
        for (let i = 0; i < 60; i++) {
            const sc_numbers = document.createElement("div");
            sc_numbers.classList.add("sc_numbers");
            sc_numbers.style.transform = `rotate(${i * 6}deg)`;

            if (i % 5 === 0) {
                sc_numbers.innerHTML = (i / 5) * 5;
                sc_numbers.style.transform += ` translateY(-95px)`;
                sc_numbers.style.fontSize = "0.8rem";
            } else {
                sc_numbers.innerHTML = "|";
                sc_numbers.style.transform += ` translateY(-115px)`;
                sc_numbers.style.fontSize = "1rem";
            }
            sc_dial.appendChild(sc_numbers);
        }
    }

    setup_rings() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rings = [];
        for (let i = 0; i < this.difficulty; i++) {
            this.rings.push({
                radius: (40 * this.difficulty) - (i * 50),
                marker_notch: Math.random() * Math.PI * 2,
                rotating_notch: Math.random() * Math.PI * 2,
                notch_aligned: false
            });
        }
    }

    draw_rings() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.rings.forEach(ring => this.draw_ring(ring));
    }

    draw_ring(ring) {
        const ring_thickness = 21;
        const notch_width = 0.3;
        const notch_2 = 0.05;

        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, ring.radius, 0, Math.PI * 2);
        this.ctx.lineWidth = ring_thickness;
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0)";
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, ring.radius, ring.marker_notch - notch_width / 2, ring.marker_notch + notch_width / 2);
        this.ctx.lineWidth = ring_thickness;
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0)";
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(this.center.x, this.center.y, ring.radius, ring.rotating_notch - notch_2 / 2, ring.rotating_notch + notch_2 / 2);
        this.ctx.lineWidth = ring_thickness;
        this.ctx.strokeStyle = ring.notch_aligned ? "rgba(0, 255, 0, 0)" : "rgba(255, 0, 0, 0)";
        this.ctx.stroke();

        this.ctx.lineWidth = 1;
    }

    rotate_ring(index, delta) {
        if (this.is_rotating) return;
        this.is_rotating = true;
        this.rings[index].rotating_notch = (this.rings[index].rotating_notch + delta + Math.PI * 2) % (Math.PI * 2);
        this.check_alignment_zone(index);
        this.draw_rings();

        const sc_dial = document.querySelector(".sc_dial");
        const current_rotation = parseFloat(sc_dial.getAttribute("data-rotation") || 0);
        const new_rotation = current_rotation + (delta * (180 / Math.PI));
        sc_dial.style.transform = `rotate(${new_rotation}deg)`;
        sc_dial.setAttribute("data-rotation", new_rotation.toString());

        setTimeout(() => {
            this.is_rotating = false;
        }, 10);
    }

    check_alignment_zone(index) {
        const ring = this.rings[index];
        const tolerance = 0.15;
        const angle_difference = Math.abs(ring.rotating_notch - ring.marker_notch);
        const effective_difference = Math.min(angle_difference, Math.PI * 2 - angle_difference);
        if (effective_difference < tolerance && !ring.aligned_sound) {
            this.play_sound("aligned");
            ring.aligned_sound = true;
        } else if (effective_difference >= tolerance) {
            ring.aligned_sound = false;
        }
    }

    update_notch_alignment(index) {
        const ring = this.rings[index];
        const tolerance = 0.1;
        const angle_difference = Math.abs(ring.rotating_notch - ring.marker_notch);
        const effective_difference = Math.min(angle_difference, Math.PI * 2 - angle_difference);
        ring.notch_aligned = effective_difference < tolerance;
    }

    check_completion() {
        const aligned = this.rings.every(ring => ring.notch_aligned);
        if (aligned) this.game_end(true);
    }

    game_end(success) {
        clearInterval(this.timer_interval);
        this.play_sound(success ? "success" : "failed");
        setTimeout(() => {
            $("#main_container").empty();
            $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "safecrack", success }));
        }, 2000);
    }

    play_sound(sound_key) {
        if (this.audio[sound_key]) {
            const sound = new Audio(this.audio[sound_key]);
            sound.volume = sound_key === "aligned" ? this.audio.aligned_volume : this.audio.volume;
            sound.play();
        }
    }
}

