/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

export default class PacketSnatch {
    constructor() {
        this.config = {
            packet_count: 25,
            allowed_misses: 5,
            spawn_interval: 800,
            fall_duration: 4000,
            legit_chance: 0.65
        };

        this.canvas = null;
        this.ctx = null;
        this.packets = [];
        this.spawn_timer = null;
        this.raf = null;
        this.successes = 0;
        this.misses = 0;
        this.total_spawned = 0;
        this.running = false;
        this.device_scale = window.devicePixelRatio || 1;
    }

    async init(data) {
        this.config = { ...this.config, ...data };
        this.build_ui();
        this.setup_canvas_resolution();
        this.running = true;
        this.spawn_loop();
        this.animate();
    }

    build_ui() {
        const html = `
            <div class="minigame_container packet_snatch">
                <div class="minigame_header">
                    <div class="packet_snatch_info">
                        Hits: <span id="packet_hits">0</span> | Misses: <span id="packet_misses">0</span>
                    </div>
                </div>
                <canvas id="packet_canvas" style="background:#111; border:1px solid #555; width:364px; height:300px; margin: 1vh;"></canvas>
            </div>
        `;
        $("#main_container").html(html);
        this.canvas = document.getElementById("packet_canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("click", (e) => this.handle_click(e));
    }

    setup_canvas_resolution() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.device_scale;
        this.canvas.height = rect.height * this.device_scale;
        this.ctx.scale(this.device_scale, this.device_scale);
    }

    spawn_loop() {
        this.spawn_timer = setInterval(() => {
            if (this.total_spawned >= this.config.packet_count) {
                clearInterval(this.spawn_timer);
                return;
            }
            this.spawn_packet();
        }, this.config.spawn_interval);
    }

    spawn_packet() {
        const is_legit = Math.random() < this.config.legit_chance;
        const x = Math.random() * (this.canvas.width / this.device_scale - 40);
        const y = -25;
        const spawn_time = performance.now();

        this.packets.push({ x, y, is_legit, spawn_time });
        this.total_spawned++;
    }

    handle_click(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scale_x = this.canvas.width / rect.width;
        const scale_y = this.canvas.height / rect.height;

        const mx = (e.clientX - rect.left) * scale_x / this.device_scale;
        const my = (e.clientY - rect.top) * scale_y / this.device_scale;

        for (let i = 0; i < this.packets.length; i++) {
            const pkt = this.packets[i];
            if (mx >= pkt.x && mx <= pkt.x + 40 && my >= pkt.y && my <= pkt.y + 25) {
                if (pkt.is_legit) {
                    this.successes++;
                    $("#packet_hits").text(this.successes);
                } else {
                    this.misses++;
                    $("#packet_misses").text(this.misses);
                }
                this.packets.splice(i, 1);
                this.check_game_end();
                return;
            }
        }
    }

    animate() {
        if (!this.running) return;

        const now = performance.now();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.packets.length - 1; i >= 0; i--) {
            const pkt = this.packets[i];
            const time_alive = now - pkt.spawn_time;
            const progress = time_alive / this.config.fall_duration;
            pkt.y = progress * (this.canvas.height / this.device_scale);

            if (pkt.y > this.canvas.height / this.device_scale) {
                if (pkt.is_legit) {
                    this.misses++;
                    $("#packet_misses").text(this.misses);
                }
                this.packets.splice(i, 1);
                this.check_game_end();
                continue;
            }

            this.ctx.fillStyle = pkt.is_legit ? "#4caf50" : "#f44336";
            this.ctx.fillRect(pkt.x, pkt.y, 40, 25);

            this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(pkt.x, pkt.y, 40, 25);
        }

        this.raf = requestAnimationFrame(() => this.animate());
    }

    check_game_end() {
        if (this.misses > this.config.allowed_misses || (this.total_spawned >= this.config.packet_count && this.packets.length === 0)) {
            this.running = false;
            cancelAnimationFrame(this.raf);
            clearInterval(this.spawn_timer);

            const success = this.misses <= this.config.allowed_misses;
            const result = success ? "SUCCESS" : "FAILED";
            const html = `<div class="minigame_container pulse_sync"><div class="minigame_result_screen">${result}</div></div>`;
            
            $("#main_container").html(html);

            setTimeout(() => {
                $("#main_container").empty();
                $.post(`https://${GetParentResourceName()}/minigame_result`, JSON.stringify({ game: "packet_snatch", success }));
            }, 2000);
        }
    }
}