# Puzzle-Pipes-Solver-Extension
A Google Chrome extension for solving the [Puzzle Pipes](puzzle-pipes.com) game.
Due to event-triggering limitations, the extension cannot actually interact with the puzzle itself, but it can indicate which tiles to arrange how (as shown below), which... well, close enough. 😅
<p align=center><img src=https://github.com/user-attachments/assets/3051f796-6d6b-4845-8921-182ed6eaa0e8></p>

## Installation
If this were a thorough Google Store release, I'd simply point you to the Google Store page and tell you to install it from there.

However, this is not a thorough Google Store release. Instead, you can download this code and install the extension manually.\
Google provides a [short and to-the-point guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) in their Google Chrome extension starter tutorial, but the steps boil down to:
1. dowload the code to a directory of your choice (ideally give it its own folder, to avoid interference)
2. go to `chrome://extensions` (or open the Extensions menu from the Chrome options)
3. turn Developer Mode on from the toggle switch
4. click the 'Load Unpacked' button and select the directory you downloaded the code to
5. (optional) if you work in Incognito mode, go to Details on the Puzzle-Pipes Solver extension and toggle on 'Allow in Incognito'

The extension should now be installed. To remove it in the future, simply click the 'Remove' button in the Extensions menu.

## Usage
The extension is automatically active when you navigate to [puzzle-pipes.com](puzzle-pipes.com). You can tell that it is on because it adds two new buttons at the bottom of the puzzle menu, like so:
<p align=center><img src=https://github.com/user-attachments/assets/42f25466-ed9c-49e3-8ce9-882aabe01e4f></p>

Pressing the 'Solve One Cell' button will highlight a cell, indicating how many steps away it is from the correct position:
- ![Orange](https://placehold.co/12/orange/orange) **Orange** for 3 steps away
- ![Gold](https://placehold.co/12/gold/gold) **Gold** for 2 steps away
- ![Yellowgreen](https://placehold.co/12/yellowgreen/yellowgreen) **Lime** for 1 step away
- ![Forestgreen](https://placehold.co/12/forestgreen/forestgreen) **Forest Green** for correct position

You can have multiple highlighted cells at once (the highlights go away when you pin the cell correctly):\
![image](https://github.com/user-attachments/assets/347a12be-9c14-4cae-a69f-ffbdb43d7c68)

If the solver fails to find any new cells to highlight, try aligning and pinning some of the currently highlighted ones.
If you have pinned everything highlighted and the it still can't figure out a new cell recommendation, you'll need to solve a few cell manually (correctly, if possible) to help it out.
Although the solver can be fairly clever, its solving strategies are still relatively rudimentary, so it sometimes gets stumped in more difficult situations. (The start of some wrap puzzles, for instance.)

( As for the 'Refresh Grid Display' button, it shows a very hieroglyphic ASCII representation of the grid as the extension sees it when you click the button. It's not very useful now, but that's how I displayed the grid early in development, so I left it in for a chuckle. )\
![image](https://github.com/user-attachments/assets/50776e64-ea29-44ab-b735-96a5d84ae529)


