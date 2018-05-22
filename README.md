# saveen-cs573
# Assignment 2 - Visualize 3 Datasets

## Demo URL

https://saveen-cs573.herokuapp.com/

## General

This application creates visuals for the following three datasets:

  1. population-densities-of-the-world
  2. pokemon-base-stats
  3. TED-tags-ratings-and-views

The application uses JQuery to get the file, PapaParse to convert the CSV into JSON, and
CanvasJS to create the visuals.

## Running the application

Once the app has loaded, the user can select which of the three datasets to view first.

 1. population-densities-of-the-world:
    * This visualization plots each country of the world as a bubble with the following  characteristics:
      * X-Position - The size of the country in square miles
      * Y-Position - The population of the country
      * Radius - The population density of the country in (people per square mile)
      * Opacity - The literacy rate of the country as a percentage
    * The user may hover over a bubble to see the information about a specific country.
    * The user may also click on the chart and drag to zoom in on a part of the graph (from there, the user can pan the chart using the options that appear in the upper-right corner)
  
 2. pokemon:
    * This visualization begins by plotting the average base stats of each of the primary types of pokemon as a stacked column.
    * The user can click on any of the columns to see the base stats for each specific pokemon of that primary type.
    * After drilling down into a specific pokemon type, the user can click the Back button in the upper-left to return back to the overview
    * The user also has the same options as before in terms of clicking and dragging on the chart to zoom-in/allow panning.
    
 3. TED Tags-ratings-and-views:
    * This visualization initially displays two charts overlays on one another. The first chart is a column chart that shows the number of TED Talks with a certain tag. The second chart is an area chart that plots the total number of views all of the TED Talks with a certain tag have gotten. Keep in mind that a TED Talk can have multiple tags so they are counted multiple time throughout this chart.
    * The user can then select a tag by clicking on either the column or area point. This brings up a second chart that again plots two charts on top of each other. The first chart is a stacked-column chart where each stack is a rating (e.g. Someone rated a TED Talk as 'Informative') and it's height is the number of times that specific TED Talk received that rating. The second chart plots the number of views that TED Talk has received. This helps correlate the number of ratings to the popularity of a Talk.
    * The user also has the same options as before in terms of clicking and dragging on the chart to zoom-in/allow panning.
