/*
  TODO:
    * percent of total number for base stats and for types
    * clean up renderBtn disable logic (disable options in firstParam?)
    * handle click through
*/
$(document).ready(function () {
  // declare app-level variables
  var firstParam = $('#first-parameter');
  var secondParam = $('#second-parameter');
  var renderBtn = $('#render-button');
  var myChart = $('#myChart');
  var introMessage = $('#intro-message');
  var backButton = $('#back-button');
  var chart;
  var pokemonData;
  var dataToRender;
  var axisY1Label;
  var axisY2Label;

  init();

  /**
   * @desc Initializes the application by reading and parsing the csv file
   */
  function init() {
    var dataPromise = readDataset('final-pokemon.csv');
    dataPromise.then(function (data) {
      var parsedData = parseData(data);

      pokemonData = convertPokemonData(parsedData);
      buildCanvasObjects(pokemonData);
    });
  }

  /**
   * @desc Removes the drilled down chart and plots the exterior chart
   */
  backButton.on('click', function() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    plotPokemonData(dataToRender, axisY1Label, axisY2Label);
  });

  /**
   * @desc Handles the display of the second dropdown based on the choice selected in the first dropdown
   */
  firstParam.on('change', function() {
    var firstChoice = firstParam.val();
    var secondChoice = secondParam.val();

    // disable the second dropdown when 'all' is selected
    if (firstChoice === 'all') {
      secondParam.attr('disabled', 'disabled');
      renderBtn.removeClass('disabled');
    } else {
      // temp logic to disable render button when user selects the same choice in both dropdowns
      if (firstChoice && secondChoice && firstChoice !== secondChoice) {
        renderBtn.removeClass('disabled');
      } else if (firstChoice && secondChoice && firstChoice === secondChoice) {
        renderBtn.addClass('disabled');
      }

      secondParam.removeAttr('disabled');
      // disable the selected option in the second dropdown
      secondParam.children().each(function () {
        var option = $(this);

        if (option.val() === firstChoice) {
          option.attr('disabled', 'disabled');
        } else if (option.val() !== 'title') {
          option.removeAttr('disabled');
        }
      });
    }
  });

  /**
   * @desc When the user selects an option in the second dropdown
   */
  secondParam.on('change', function() {
    var firstChoice = firstParam.val();
    var secondChoice = secondParam.val();

    if (firstChoice && secondChoice && firstChoice !== secondChoice) {
      renderBtn.removeClass('disabled');
    } else if (firstChoice && secondChoice && firstChoice === secondChoice) {
      renderBtn.addClass('disabled')
    }
  });

  /**
   * @desc Handles the click event on the Render button
   */
  renderBtn.on('click', function() {
    if (!$(this).hasClass('disabled')) {
      introMessage.hide();
      // passes along the selected parameters to the render function
      renderPokemonData(firstParam.val(), secondParam.val());
    }
  });

  /********** HELPER FUNCTIONS  **********/

  /**
   * @desc Calculates the variance for the sample
   * @param {Number} avg The average of the sample
   * @param {Array} sample The array of values that created avg
   */
  function calculateVariance(avg, sample) {
    var averageDeviation = 0;

    for (var i = 0; i < sample.length; i += 1) {
      averageDeviation += Math.pow((sample[i] - avg), 2);
    }

    return (averageDeviation / (sample.length - 1));
  }

  /**
   * @desc Capitalizes the first letter of each word
   * @param {String} text The string to capitalize
   * @return {String} The capitalized string
   */
  function capitalize(text) {
    return text.replace(/\w\S*/g, function(match) {
      return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
    });
  }

  /**
   * @desc Toggles the respective data series when the user clicks on it in the legend
   * @param {Event} event The canvasJS click event (contains the respective data series)
   */
  function onLegendClick(event) {
    if (typeof (event.dataSeries.visible) === 'undefined' || event.dataSeries.visible) {
      event.dataSeries.visible = false;
    } else {
      event.dataSeries.visible = true;
    }

    event.chart.render();
  }

  /**
   * @desc Pads the beginning of the input string with 0's to meet the input size
   * @param {String} text The number to pad
   * @param {Number} size The size you would like the end return string to be
   */
  function padStart(text, size) {
    while (text.length < size) text = "0" + text;
    return text;
  }

  /**
   * @desc Uses PapaParse to convert CSV data to JSON
   * @param {String} data CSV String to parse through and convert
   * @return {Object} JSON representation of the data passed in
   */
  function parseData(data) {
    return Papa.parse(data, { headers: true }).data;
  }

  /**
   * @desc Uses a jQuery GET request to read a file
   * @param {String} fileName The file to read. Make sure it's in the /datasets folder!
   * @return {Promise} The file data in CSV format
   */
  function readDataset(fileName) {
    var filePath = './datasets/' + fileName;
    return $.get(filePath);
  }

  /**
   * @desc Displays the back button for the user to click (when the user drills down and wants to go back)
   */
  function showBackButton() {
    backButton.addClass('show');
  }

  /**
   * @desc Hides the back button when the user can't go back up (user is already seeing the overview)
   */
  function hideBackButton() {
    backButton.removeClass('show');
  }

  /**
   * @desc Iterates over the harvested data and builds canvasJS option objects
   */
  function buildCanvasObjects() {
    for (var i = 0; i < baseStats.length; i += 1) {
      var statName = baseStats[i];
      var capStatName = capitalize(statName);

      canvasData.baseStats.push({
        type: 'stackedColumn',
        showInLegend: true,
        color: canvasColors.baseStats[statName],
        name: capStatName,
        dataPoints: pokemonData.averages[statName],
        toolTipContent: '<b>Generation {label}:</b><br/>Average <b>' + capStatName + '</b>: {y}<br/>Click to visualize <b>Generation {label}</b>',
        click: handlePokemonGenClick
      });
    }

    for (var i = 0; i < pokemonTypes.length; i += 1) {
      var type = pokemonTypes[i];
      var capType = capitalize(type);

      canvasData.types.push({
        type: 'stackedColumn',
        showInLegend: true,
        name: capType,
        color: canvasColors.types[type],
        dataPoints: pokemonData.numOfType[type],
        toolTipContent: '<b>Generation {label}:</b><br/>Number of <b>' + capType + '</b> Pokémon Introduced: {y}<br/>Percentage of Total Pokémon Added: {p}%<br/>Total votes for <b>' + capType + '</b> Pokémon: {v}<br/>Percentage of Total Votes: {pv}%<br/>Click to visualize <b>' + capType + '</b> type pokémon in <b>Generation {label}</b>',
        click: handlePokemonTypeGenClick
      });
    }

    canvasData.totalFav = [
      {
        type: 'line',
        showInLegend: true,
        name: 'Favorites',
        color: 'white',
        dataPoints: pokemonData.genFavorites,
        toolTipContent: '<b>Generation {label}:</b><br/>Number of Votes: {y}<br/><b>{mp}</b> had the <b>most votes</b> at <b>{mv}</b> votes<br/><b>{lp}</b> had the <b>least votes</b> at <b>{lv}</b> votes<br/>Click to visualize <b>Generation {label}</b>',
        click: handlePokemonGenClick
      }
    ];

    canvasData.avgFav = [
      {
        type: 'line',
        showInLegend: true,
        name: 'Avg. Number of Favorites',
        color: 'white',
        dataPoints: pokemonData.averages.favorites,
        toolTipContent: '<b>Generation {label}:</b><br/>Avg. Number of Votes per Pokémon: {y}<br/>Sample variance: {v}<br/>Sample standard deviation: {stddev}<br/>Click to visualize <b>Generation {label}</b>',
        click: handlePokemonGenClick
      }
    ];
  }

  /**
   * @desc Builds the final canvasJS option objects to be rendered
   * @param {String} firstParam The option selected from the first dropdown
   * @param {String} secondParam The option selected from the second dropdown
   */
  function renderPokemonData(firstParam, secondParam) {
    if (firstParam === 'all') {
      canvasData.totalFav[0].color = 'red';

      // left Y-axis
      var primaryData = canvasData.baseStats.concat(canvasData.totalFav);
      // right Y-axis
      var secondaryData = canvasData.types.concat(canvasData.avgFav);

      for (var i = 0; i < primaryData.length; i += 1) {
        primaryData[i].axisYType = 'primary';
      }

      for (var j = 0; j < secondaryData.length; j += 1) {
        secondaryData[j].axisYType = 'secondary';
      }

      dataToRender = canvasData.baseStats.concat(secondaryData, canvasData.totalFav);
      axisY1Label = 'Pokémon Average Base Stats & Total Favorite Votes';
      axisY2Label = 'Number of Pokémon Introduced by Type & Average Votes per Pokémon'
    } else {
      var firstParamData = canvasData[firstParam];
      var secondParamData = canvasData[secondParam];

      for (var i = 0; i < firstParamData.length; i += 1) {
        firstParamData[i].axisYType = 'primary';
      }

      for (var j = 0; j < secondParamData.length; j += 1) {
        secondParamData[j].axisYType = 'secondary';
      }

      // apply some colors to the lines to help them stick out
      if (firstParamData[0].type === 'line' && secondParamData[0].type === 'line') {
        firstParamData[0].color = 'red';
        secondParamData[0].color = 'white';
      } else if (firstParamData[0].type === 'line' && secondParamData[0].type !== 'line') {
        firstParamData[0].color = 'white';
      } else if (firstParamData[0].type !== 'line' && secondParamData[0].type === 'line') {
        secondParamData[0].color = 'white';
      }

      // Make sure that the line renders second so that it appears above the other data
      if (firstParamData[0].type === 'line') {
        dataToRender = secondParamData.concat(firstParamData);
      } else {
        dataToRender = firstParamData.concat(secondParamData);
      }

      axisY1Label = getLabel(firstParam);
      axisY2Label = getLabel(secondParam);
    }
    plotPokemonData(dataToRender, axisY1Label, axisY2Label);
  }

  /**
   * @desc Gets the associated label to display along the Y-axis
   * @param {String} param The option selected in the dropdown
   * @return {String} A label to help the user identify what data they are looking at
   */
  function getLabel(param) {
    switch (param) {
      case 'baseStats':
        return 'Pokémon Average Base Stats';
      case 'types':
        return 'Number of Pokémon Introduced by Type';
      case 'totalFav':
        return 'Total Favorite Votes';
      case 'avgFav':
        return 'Average Votes per Pokémon';
    }
  }

  /**
   * @desc Builds intermediary data structures from the JSON representation of the data
   * @param {Object} data The JSON representation of the data
   * @return {Object} A collection of useful intermediary data structures
   */
  function convertPokemonData(data) {
    var averages = jQuery.extend(true, {}, baseStatsTemplate);
    var generations = jQuery.extend(true, {}, generationToArrayTemplate);
    var pokemonGens = {};
    var pokemonTypeGens = jQuery.extend(true, {}, generationsToObjectTemplate);
    var numOfType = {};
    var genFavorites = [];

    // iterate over data and split values by pokémon generation
    for (var i = 1; i < data.length - 1; i += 1) {
      var row = data[i];
      var gen = row[0];

      generations[gen].push(row);
    }

    // iterate over all the pokémon generations and calculate various values / averages
    for (var generation in generations) {
      if (generations.hasOwnProperty(generation)) {
        var gen = generations[generation];
        var sumAtk = sumDef = sumHP = sumSpAtk = sumSpDef = sumSpd = sumFavorites = 0;
        var mostVotes = 0, leastVotes = 9999;
        var mostVotedPokemon = leastVotedPokemon = '';
        var primaryType;
        var genSumTypes = {};
        var capGeneration = capitalize(generation);
        var genVotesArray = [];

        pokemonGens[generation] = jQuery.extend(true, {}, baseStatsTemplate);

        // iterate over the pokémon in each generation
        for (var i = 0; i < gen.length; i += 1) {
          var pokemon = gen[i];
          var capLabel = capitalize(pokemon[1]);
          primaryType = pokemon[3];
          var votesCasted = parseInt(pokemon[12]);
          genVotesArray.push(votesCasted);

          if (votesCasted > mostVotes) {
            mostVotes = votesCasted;
            mostVotedPokemon = capLabel;
          }

          if (votesCasted < leastVotes) {
            leastVotes = votesCasted;
            leastVotedPokemon = capLabel;
          }

          if (genSumTypes[primaryType]) {
            genSumTypes[primaryType].count += 1;
            genSumTypes[primaryType].votes += votesCasted;
          } else {
            genSumTypes[primaryType] = {
              count: 1,
              votes: votesCasted
            };
          }

          if (!pokemonTypeGens[generation][primaryType]) {
            pokemonTypeGens[generation][primaryType] = jQuery.extend(true, {}, baseStatsTemplate);
          }

          pokemonTypeGens[generation][primaryType].attack.push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[4]), p: ((pokemon[4] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonTypeGens[generation][primaryType].defense.push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[5]), p: ((pokemon[5] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonTypeGens[generation][primaryType]['hit points'].push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[6]), p: ((pokemon[6] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonTypeGens[generation][primaryType]['special attack'].push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[7]), p: ((pokemon[7] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonTypeGens[generation][primaryType]['special defense'].push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[8]), p: ((pokemon[8] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonTypeGens[generation][primaryType].speed.push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[9]), p: ((pokemon[9] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonTypeGens[generation][primaryType].favorites.push({ label: capLabel, dexNum: pokemon[2], y: votesCasted, r: pokemon[11] });

          pokemonGens[generation].attack.push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[4]), p: ((pokemon[4] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonGens[generation].defense.push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[5]), p: ((pokemon[5] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonGens[generation]['hit points'].push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[6]), p: ((pokemon[6] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonGens[generation]['special attack'].push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[7]), p: ((pokemon[7] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonGens[generation]['special defense'].push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[8]), p: ((pokemon[8] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonGens[generation].speed.push({ label: capLabel, dexNum: pokemon[2], y: parseInt(pokemon[9]), p: ((pokemon[9] / pokemon[10]) * 100).toFixed(1), r: pokemon[11] });
          pokemonGens[generation].favorites.push({ label: capLabel, dexNum: pokemon[2], y: votesCasted, r: pokemon[11] });

          sumAtk += parseInt(pokemon[4]);
          sumDef += parseInt(pokemon[5]);
          sumHP += parseInt(pokemon[6]);
          sumSpAtk += parseInt(pokemon[7]);
          sumSpDef += parseInt(pokemon[8]);
          sumSpd += parseInt(pokemon[9]);
          sumFavorites += votesCasted;
        }

        // iterate over the 18 pokémon types
        for (var type of pokemonTypes) {
          if (!numOfType[type]) {
            numOfType[type] = [];
          }

          if (genSumTypes[type]) {
            numOfType[type].push({
              label: capGeneration,
              y: genSumTypes[type].count,
              p: ((genSumTypes[type].count / gen.length) * 100).toFixed(2),
              v: genSumTypes[type].votes,
              pv: ((genSumTypes[type].votes / sumFavorites) * 100).toFixed(2),
              type
            });
          } else {
            numOfType[type].push({});
          }
        }

        var avgFavorites = (sumFavorites / gen.length);

        genVariance = calculateVariance(avgFavorites, genVotesArray);
        genStdDev = Math.sqrt(genVariance).toFixed(2);

        averages.attack.push({ label: capGeneration, y: Math.round(sumAtk / gen.length) });
        averages.defense.push({ label: capGeneration, y: Math.round(sumDef / gen.length) });
        averages['hit points'].push({ label: capGeneration, y: Math.round(sumHP / gen.length) });
        averages['special attack'].push({ label: capGeneration, y: Math.round(sumSpAtk / gen.length) });
        averages['special defense'].push({ label: capGeneration, y: Math.round(sumSpDef / gen.length) });
        averages.speed.push({ label: capGeneration, y: Math.round(sumSpd / gen.length) });
        averages.favorites.push({ label: capGeneration, y: Math.round(avgFavorites),  v: genVariance.toFixed(2), stddev: genStdDev });

        genFavorites.push({ label: capGeneration, y: sumFavorites, mv: mostVotes, mp: mostVotedPokemon, lv: leastVotes, lp: leastVotedPokemon });
      }
    }

    return { averages, pokemonGens, pokemonTypeGens, numOfType, genFavorites };
  }

  function handlePokemonClick(event) {
    var dexNumClicked = padStart(event.dataPoint.dexNum, 3);

    window.open('https://www.serebii.net/pokedex-sm/' + dexNumClicked + '.shtml', '_blank');
  }

  /**
   * @desc Displays the drilled down chart when the user clicks on a pokémon type
   * @param {Event} event A canvasJS event with the datapoint clicked on
   */
  function handlePokemonGenClick(event) {
    showBackButton();
    var genClicked = event.dataPoint.label.toLowerCase();
    var drilldownChartTitle = capitalize(genClicked);
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'dark1',
      title: {
        text: 'Base Stats for Generation ' + drilldownChartTitle + ' Pokémon'
      },
      axisX: {
        title: 'Pokémon'
      },
      axisY: {
        title: 'Stat Values'
      },
      axisY2: {
        title: 'Favotite Votes'
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      legend: {
        cursor: 'pointer',
        itemclick: onLegendClick
      },
      data: [
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#da4f4a',
          name: 'Attack',
          dataPoints: pokemonData.pokemonGens[genClicked].attack,
          toolTipContent: 'Base <b>attack</b> of <b>{label}</b>: <b>{y}</b><br/><b>Attack</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#016ecd',
          name: 'Defense',
          dataPoints: pokemonData.pokemonGens[genClicked].defense,
          toolTipContent: 'Base <b>defense</b> of <b>{label}</b>: <b>{y}</b><br/><b>Defense</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#5ab75c',
          name: 'Hit Points',
          dataPoints: pokemonData.pokemonGens[genClicked]['hit points'],
          toolTipContent: 'Base <b>hit points</b> of <b>{label}</b>: <b>{y}</b><br/><b>Hit Points</b> make up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#faa632',
          name: 'Special Attack',
          dataPoints: pokemonData.pokemonGens[genClicked]['special attack'],
          toolTipContent: 'Base <b>special attack</b> of <b>{label}</b>: <b>{y}</b><br/><b>Special Attack</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#4aafcd',
          name: 'Special Defense',
          dataPoints: pokemonData.pokemonGens[genClicked]['special defense'],
          toolTipContent: 'Base <b>special defense</b> of <b>{label}</b>: <b>{y}</b><br/><b>Special Defense</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#9d29b2',
          name: 'Speed',
          dataPoints: pokemonData.pokemonGens[genClicked].speed,
          toolTipContent: 'Base <b>speed</b> of <b>{label}</b>: <b>{y}</b><br/><b>Speed</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'line',
          axisYType: 'secondary',
          showInLegend: true,
          name: 'Favorite Votes',
          color: 'white',
          dataPoints: pokemonData.pokemonGens[genClicked].favorites,
          toolTipContent: 'Votes casted for <b>{label}</b>: <b>{y}</b><br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        }
      ]
    });
    chart.render();
  }

  function handlePokemonTypeGenClick(event) {
    showBackButton();
    var genClicked = event.dataPoint.label.toLowerCase();
    var typeClicked = event.dataPoint.type.toLowerCase();

    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'dark1',
      title: {
        text: 'Base Stats and Favorite Votes for Generation ' + capitalize(genClicked) + ' - ' + capitalize(typeClicked) + ' Pokémon'
      },
      axisX: {
        title: 'Pokémon'
      },
      axisY: {
        title: 'Stat Values'
      },
      axisY2: {
        title: 'Favorite Votes'
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      legend: {
        cursor: 'pointer',
        itemclick: onLegendClick
      },
      data: [
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#da4f4a',
          name: 'Attack',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked].attack,
          toolTipContent: 'Base <b>attack</b> of <b>{label}</b>: <b>{y}</b><br/><b>Attack</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#016ecd',
          name: 'Defense',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked].defense,
          toolTipContent: 'Base <b>defense</b> of <b>{label}</b>: <b>{y}</b><br/><b>Defense</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#5ab75c',
          name: 'Hit Points',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked]['hit points'],
          toolTipContent: 'Base <b>hit points</b> of <b>{label}</b>: <b>{y}</b><br/><b>Hit Points</b> make up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#faa632',
          name: 'Special Attack',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked]['special attack'],
          toolTipContent: 'Base <b>special attack</b> of <b>{label}</b>: <b>{y}</b><br/><b>Special Attack</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#4aafcd',
          name: 'Special Defense',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked]['special defense'],
          toolTipContent: 'Base <b>special defense</b> of <b>{label}</b>: <b>{y}</b><br/><b>Special Defense</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#9d29b2',
          name: 'Speed',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked].speed,
          toolTipContent: 'Base <b>speed</b> of <b>{label}</b>: <b>{y}</b><br/><b>Speed</b> makes up <b>{p}%</b> of base stats total<br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        },
        {
          type: 'line',
          axisYType: 'secondary',
          showInLegend: true,
          name: 'Favorite Votes',
          color: 'white',
          dataPoints: pokemonData.pokemonTypeGens[genClicked][typeClicked].favorites,
          toolTipContent: 'Votes casted for <b>{label}</b>: <b>{y}</b><br/>This pokémon is <b>{r}</b><br/>Click to see all data about <b>{label}</b> (opens external link)',
          click: handlePokemonClick
        }
      ]
    });
    chart.render();
  } 

  /**
   * @desc Renders the canvasJS chart with the final data
   * @param {[Object]} data The canvasJS data to render
   * @param {String} axisY1Label The label to display on the left Y-axis
   * @param {String} axisY2Label The label to display on the right Y-axis
   */
  function plotPokemonData(data, axisY1Label, axisY2Label) {
    hideBackButton();
    myChart.show();
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'dark1',
      axisX: {
        title: 'Pokémon Generation'
      },
      axisY: {
        title: axisY1Label
      },
      axisY2: {
        title: axisY2Label
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      legend: {
        cursor: 'pointer',
        itemclick: onLegendClick
      },
      data
    });
    chart.render();
  }
});