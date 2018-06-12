# saveen-cs573
# Project 3 - Interactive Visualization

## Demo URL

https://saveen-cs573.herokuapp.com/

## General

This application visualizes the compiled pokémon dataset. This combines the original pokémon data with some player's
favorite pokémon data obtained by posting a survey on http://reddit.com/r/pokemon and on http://reddit.com/r/pokemongo.

The survey allowed participants to select all of their favorite pokémon across all of the generations. Some users picked tens
of pokémon and others picked only a handful. Overall, I received around 1200 responses with 36,308 votes over the 807 pokémon choices.

The application uses JQuery to get the file, PapaParse to convert the CSV into JSON, and CanvasJS to create the visuals.

## Running the application

Once the app has loaded, the user is able to select two parameters to visualize. There are 4 parameters that the user can mix and match to draw various conclusions:

  1. "Average Base Stats" will show the average base stats (attack, defense, hp, etc.) per generation.
  2. "Types Introduced" will show the number of pokémon added per generation split by the 18 types (bug, dark, dragon, etc.)
  3. "Total Favorite Votes" will show the total votes casted in a single generation.
  4. "Average Favotite Votes" will take the total votes casted per generation and normalize it by dividing it the number of pokémon in that generation.
  
If the user would like to see all the data, they may select "Show all data" in the first dropdown and then click "Render". For each visualization, the user can:

  * Hover over a data point or column to see a tooltip containing information about that point/column.
  * Click on an item in the legend (below the chart) to hide/show it on the chart.
