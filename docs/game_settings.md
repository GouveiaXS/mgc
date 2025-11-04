Each minigame has a selection of customisable settings.  
You can send these through the `data = {}` table.  

Refer back to this documentation if you need any guidance.  

# Anagram

```lua
exports.mgc:start_game({
    game = 'anagram',
    data = {
        loading_time = 5000, -- time taken before game starts
        difficulty = 1, -- increases difficulty; see word list in Anagram.js
        guesses = 5, -- max guesses allowed
        timer = 30000 -- total time limit (ms)
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Bit Flip

```lua
exports.mgc:start_game({
    game = 'bit_flip',
    data = {
        length = 3, -- length of code sequence to solve
        timer = 30000 -- total time allowed
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Button Mash

```lua
exports.mgc:start_game({
    game = 'button_mash',
    data = {
        difficulty = 3 -- higher = faster tapping required
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Chip Hack

```lua
exports.mgc:start_game({
    game = 'chip_hack',
    data = {
        loading_time = 5000, -- delay before game starts
        chips = 3, -- number of chips to locate
        timer = 30000 -- total time limit
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Circuit Trace

```lua
exports.mgc:start_game({
    game = 'circuit_trace',
    data = {
        timer = 15000 -- total time allowed to trace the circuit
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Code Drop

```lua
exports.mgc:start_game({
    game = 'code_drop',
    data = {
        bit_speed = 1.2, -- speed of falling bits
        spawn_interval = 700, -- interval between spawns
        target_score = 10, -- score to win
        max_misses = 5 -- misses before fail
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Frequency Jam

```lua
exports.mgc:start_game({
    game = 'frequency_jam',
    data = {
        dials = 3, -- number of dials to align
        timer = 150000, -- total time allowed
        precision = 3 -- tolerance; smaller = tighter
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Hangman

```lua
exports.mgc:start_game({
    game = 'hangman',
    data = {
        loading_time = 5000, -- load delay before start
        difficulty = 3, -- higher = harder words
        timer = 45000 -- total time allowed
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Key Drop

```lua
exports.mgc:start_game({
    game = 'key_drop',
    data = {
        score_limit = 10, -- number of correct keys to win
        miss_limit = 5, -- allowed misses before fail
        fall_delay = 2000, -- time for keys to fall
        new_letter_delay = 3000 -- time between drops
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Packet Snatch

```lua
exports.mgc:start_game({
    game = 'packet_snatch',
    data = {
        packet_count = 25, -- number of packets to drop
        allowed_misses = 5, -- max misses allowed
        duration = 15000, -- total round duration (ms)
        spawn_interval = 800,-- interval between drops
        fall_duration = 3000,-- fall speed
        legit_chance = 0.65 -- chance for packet to be valid
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Pattern Lock

```lua
exports.mgc:start_game({
    game = 'pattern_lock',
    data = {
        timer = 15000 -- total time allowed to draw pattern
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Pincode

```lua
exports.mgc:start_game({
    game = 'pincode',
    data = {
        difficulty = 4 -- number of digits required; higher = harder
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Pulse Sync

```lua
exports.mgc:start_game({
    game = 'pulse_sync',
    data = {
        rounds = 1, -- number of pulses to sync
        zone_width = 10, -- width of success zone
        pulse_duration = 2500, -- ms each pulse lasts
        delay_between = 1000 -- delay between rounds
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Safe Crack

```lua
exports.mgc:start_game({
    game = 'safe_crack',
    data = {
        difficulty = 3 -- number of tumblers to align
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Signal Wave

```lua
exports.mgc:start_game({
    game = 'signal_wave',
    data = {
        match_threshold = 0.1, -- wave similarity tolerance
        adjust_step = 0.05, -- adjustment increment
        wave_length = 200, -- wave sample size
        amplitude_range = {0.5, 2.0}, -- amplitude range
        frequency_range = {0.5, 2.0}, -- frequency range
        timer = 500 -- time per wave
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Skill Bar

```lua
exports.mgc:start_game({
    game = 'skill_bar',
    data = {
        icon = "fa-solid fa-fish", -- icon shown on bar
        orientation = 1, -- 1 = horizontal, 2 = vertical
        area_size = 20, -- size of success zone
        perfect_area_size = 4, -- smaller = tighter “perfect hit”
        speed = 1.0, -- bar speed
        moving_icon = true, -- icon moves along bar
        icon_speed = 1.0 -- movement speed of icon
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Skill Circle

```lua
exports.mgc:start_game({
    game = 'skill_circle',
    data = {
        icon = "fa-solid fa-gear", -- circle icon
        speed = 0.8, -- rotation speed
        area_size = 4 -- target zone size
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Tile Shift

```lua
exports.mgc:start_game({
    game = 'tile_shift',
    data = {
        grid_size = 3, -- grid size of tile puzzle
        timer = 30000 -- total time limit
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Whack Flash

```lua
exports.mgc:start_game({
    game = 'whack_flash',
    data = {
        total_hits = 10, -- amount player has to hit
        max_misses = 3, -- amount they can miss
        flash_duration = 1000 -- duration of flash
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

# Wire Cut

```lua
exports.mgc:start_game({
    game = 'wire_cut',
    data = {
        timer = 30000, -- total time limit
        chances = 4 -- mistakes allowed before fail
    }
}, function(result)
    if result.success then
        print(('Game %s completed successfully'):format(result.game))
    else
        print(('Game %s failed'):format(result.game))
    end
end)
```

---

**All games** return:

```lua
{
    success = true or false,
    game = "game_name"
}
```