# <img width="64" alt="image" src="https://github.com/peancored/drum-hero/assets/5630034/968da3e0-11e7-4e99-94e3-4aa8df19dc38"> Drum Hero

Play your favourite Clone Hero tracks on drums, assisted by sheet music.

[DOWNLOAD](https://github.com/peancored/drum-hero/releases)

## Mac Users

If you see this message pop up, that means that you need to remove the executable from quarantine. It's not signed, since it would require paying for Apple developer account.

<img width="180" alt="image" src="https://github.com/peancored/drum-hero/assets/5630034/6f454fb1-55e7-482a-abad-bce6c41b161e">

To remove from quarantine, open a terminal and run:

```
# Change the path if necessary
xattr -r -d com.apple.quarantine /Applications/DrumHero.app
```

## Why?

Finding drumless tracks with sheet music to play along can be daunting. Thankfully, Clone Hero provides both. It has thousands of songs with what is essentially sheet music and for many of them it's possible to disable the drum audio. Albeit, the notes in these tracks are not 100% correct, they are often close enough. 

My goal was to create a tool that I can use to start moving away from only playing Clone Hero to something more serious. The next step for me is to learn to sightread the actual music, and this tool helps tremendously with that.

## Workflow

### 1. Select your Clone Hero Library directory
If you don't have one, download songs from known sources you can find online.

### 2. Search for a song you want to play
<img width="768" alt="image" src="https://github.com/peancored/drum-hero/assets/5630034/b2b1cd66-9fda-4a38-855e-52b0646b013c">

#### FYI
* If you chose an incorrect CloneHero directory, press the green floating button to browse again
* You can add a song you like to favorites by pressing the like button to make sure it always appears on top.

### 3. Press play and enjoy jamming along to your favorite track
<img width="768" alt="image" src="https://github.com/peancored/drum-hero/assets/5630034/468d9511-0014-4b43-b029-3ec583be269f">

### FYI
* If the song has audio that is separated into stems, the volume controls along with solo/mute can be used to disable the drum track.
* The currently played measure will be highlighted
* Clicking on a measure will skip audio to it
* Another difficulty can be chosen in the side menu, if expert is too hard to jam along.
* Notes are highlighted with the CloneHero colors, but this can be disabled in the side menu.

## Roadmap

- [x] 5-lane track support (GH songs are not supported for now)
- [ ] .chart support for custom charts.
- [x] Double-kick support
- [ ] Practice mode - selecting measures makes the song loop within them

## Known bugs

* Triplets sometimes render incorrectly

## Acknowledgements

* TheNathannator for the [GH/RB specification](https://github.com/TheNathannator/GuitarGame_ChartFormats)
