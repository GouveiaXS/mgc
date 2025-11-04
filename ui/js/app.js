/*
    This file is part of MGC and is licensed under the MIT License.
    See the LICENSE file in the root directory for full terms.

    © 2025 Case @ Playing In Traffic

    Support honest development - retain this credit. Don't be that guy...
*/

import SafeCrack from "/ui/js/games/SafeCrack.js";
import KeyDrop from "/ui/js/games/KeyDrop.js";
import SkillCircle from "/ui/js/games/SkillCircle.js";
import SkillBar from "/ui/js/games/SkillBar.js";
import WireCut from "/ui/js/games/WireCut.js";
import ButtonMash from "/ui/js/games/ButtonMash.js";
import Anagram from "/ui/js/games/Anagram.js";
import ChipHack from "/ui/js/games/ChipHack.js";
import Hangman from "/ui/js/games/Hangman.js";
import Pincode from "/ui/js/games/Pincode.js";
import CircuitTrace from "/ui/js/games/CircuitTrace.js";
import PatternLock from "/ui/js/games/PatternLock.js";
import TileShift from "/ui/js/games/TileShift.js";
import BitFlip from "/ui/js/games/BitFlip.js";
import FrequencyJam from "/ui/js/games/FrequencyJam.js";
import PulseSync from "/ui/js/games/PulseSync.js";
import PacketSnatch from "/ui/js/games/PacketSnatch.js";
import WhackFlash from "/ui/js/games/WhackFlash.js";
import SignalWave from "/ui/js/games/SignalWave.js";
import CodeDrop from "/ui/js/games/CodeDrop.js";

const minigames = {
    safe_crack: SafeCrack,
    key_drop: KeyDrop,
    skill_circle: SkillCircle,
    skill_bar: SkillBar,
    wire_cut: WireCut,
    button_mash: ButtonMash,
    anagram: Anagram,
    chip_hack: ChipHack,
    hangman: Hangman,
    pincode: Pincode,
    circuit_trace: CircuitTrace,
    pattern_lock: PatternLock,
    tile_shift: TileShift,
    bit_flip: BitFlip,
    frequency_jam: FrequencyJam,
    pulse_sync: PulseSync,
    packet_snatch: PacketSnatch,
    whack_flash: WhackFlash,
    signal_wave: SignalWave,
    code_drop: CodeDrop
};

function start_minigame(name, data) {
    const GameClass = minigames[name];
    if (GameClass) {
        const game = new GameClass();
        game.init(data);
    } else {
        console.warn(`Minigame "${name}" not found.`);
        $.post(`https://${GetParentResourceName()}/clear_focus`);
    }
}

window.addEventListener('message', function (event) {
    let data = event.data
    if (data.action === 'start_minigame') {
        start_minigame(data.game, data.data)
    }
})

//start_minigame("safe_crack", { difficulty: 3 });

/*
start_minigame("key_drop", {
    score_limit: 20,
    miss_limit: 20,
    fall_delay: 3000,
    new_letter_delay: 4000,
});
*/

/*
start_minigame("skill_circle", {
    icon: "fa-solid fa-gear",
    speed: 0.8,
    area_size: 4
});
*/

/*
start_minigame("skill_bar", {
    icon: "fa-solid fa-fish",
    orientation: 1,
    area_size: 20,
    perfect_area_size: 4,
    speed: 1.0,
    moving_icon: true,
    icon_speed: 1.0
});
*/

/*
start_minigame("wire_cut", {
    timer: 300000,
    chances: 4
});
*/

/*
start_minigame("button_mash", {
    difficulty: 3
});
*/

/*
start_minigame("anagram", {
    loading_time: 5000,
    difficulty: 10,
    guesses: 5,
    timer: 3000000
})
*/

/*
start_minigame("chip_hack", {
    style: "default",
    loading_time: 5000
    chips: 3,
    timer: 300000
})
*/

/*
start_minigame("hangman", {
    loading_time: 5000,
    difficulty: 3,
    timer: 450000
});
*/

/*
start_minigame("pincode", {
    difficulty: 4
});
*/

/*
start_minigame("circuit_trace", {
    timer: 15000
});
*/

/*
start_minigame("pattern_lock", {
    timer: 15000
});
*/

/*
start_minigame("tile_shift", {
    grid_size: 3,
    timer: 3000000
});
*/

/*
start_minigame("bit_flip", {
    length: 3,
    timer: 3000000
});
*/

/*
start_minigame("frequency_jam", {
    dials: 3,
    timer: 150000,
    precision: 3
});
*/

/*
start_minigame("pulse_sync", {
    rounds: 1,
    zone_width: 10,
    pulse_duration: 2500, 
    delay_between: 1000
});
*/

/*
start_minigame("packet_snatch", {
    max_packets: 25000,
    allowed_misses: 500,
    duration: 15000000,
    spawn_interval: 800,
    fall_duration: 4000,
    legit_chance: 0.65
});
*/

//start_minigame("whack_flash", {});

/*
start_minigame("signal_wave", {
    match_threshold: 0.1,
    adjust_step: 0.05,
    wave_length: 200,
    amplitude_range: [0.5, 2.0],
    frequency_range: [0.5, 2.0],
    timer: 500
});
*/

/*
start_minigame("code_drop", {
    bit_speed: 1.2,
    spawn_interval: 700,
    target_score: 10,
    max_misses: 500
});
*/