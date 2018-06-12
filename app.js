/*
  TODO:
    * percent of total number for base stats and for types
    * clean up renderBtn disable logic (disable options in firstParam?)
    * handle click through
*/
$(document).ready(function () {
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

  function init() {
    var dataPromise = readDataset('final-pokemon.csv');
    dataPromise.then(function (data) {
      var parsedData = parseData(data);

      pokemonData = convertPokemonData(parsedData);
      buildCanvasObjects(pokemonData);
    });
  }

  backButton.on('click', function() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    plotPokemonData(dataToRender, axisY1Label, axisY2Label);
  });

  firstParam.on('change', function() {
    var firstChoice = firstParam.val();
    var secondChoice = secondParam.val();

    if (firstChoice === 'all') {
      secondParam.attr('disabled', 'disabled');
      renderBtn.removeClass('disabled');
    } else {
      if (firstChoice && secondChoice && firstChoice !== secondChoice) {
        renderBtn.removeClass('disabled');
      } else if (firstChoice && secondChoice && firstChoice === secondChoice) {
        renderBtn.addClass('disabled');
      }

      secondParam.removeAttr('disabled');
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

  secondParam.on('change', function() {
    var firstChoice = firstParam.val();
    var secondChoice = secondParam.val();

    if (firstChoice && secondChoice && firstChoice !== secondChoice) {
      renderBtn.removeClass('disabled');
    } else if (firstChoice && secondChoice && firstChoice === secondChoice) {
      renderBtn.addClass('disabled')
    }
  });

  renderBtn.on('click', function() {
    if (!$(this).hasClass('disabled')) {
      introMessage.hide();
      renderPokemonData(firstParam.val(), secondParam.val());
    }
  });

  /********** HELPER FUNCTIONS  **********/
  function capitalize(text) {
    return text.replace(/\w\S*/g, function(match) {
      return match.charAt(0).toUpperCase() + match.substr(1).toLowerCase();
    });
  }

  function onLegendClick(event) {
    if (typeof (event.dataSeries.visible) === 'undefined' || event.dataSeries.visible) {
      event.dataSeries.visible = false;
    } else {
      event.dataSeries.visible = true;
    }

    event.chart.render();
  }

  function readDataset(fileName) {
    var filePath = './datasets/' + fileName;
    return $.get(filePath);
  }

  function parseData(data) {
    return Papa.parse(data, { headers: true }).data;
  }

  function showBackButton() {
    backButton.addClass('show');
  }

  function hideBackButton() {
    backButton.removeClass('show');
  }

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
        toolTipContent: '<b>Generation {label}:</b><br/>Average <i>' + capStatName + '</i>: {y}'
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
        toolTipContent: '<b>Generation {label}:</b><br/>Number of <i>' + capType +'</i> Pokémon Introduced: {y}<br/>Percentage of Total Pokémon Added: {p}%<br/>Total favorite votes for <i>' + capType + '</i> Pokémon: {v}'
      });
    }

    canvasData.totalFav = [
      {
        type: 'line',
        showInLegend: true,
        name: 'Favorites',
        color: 'white',
        dataPoints: pokemonData.genFavorites,
        toolTipContent: '<b>Generation {label}:</b><br/>Number of Favorite Votes: {y}'
      }
    ];

    canvasData.avgFav = [
      {
        type: 'line',
        showInLegend: true,
        name: 'Avg. Number of Favorites',
        color: 'white',
        dataPoints: pokemonData.averages.favorites,
        toolTipContent: '<b>Generation {label}:</b><br/>Avg. Number of Favorite Votes per Pokémon: {y}'
      }
    ];
  }

  function renderPokemonData(firstParam, secondParam) {
    if (firstParam === 'all') {
      canvasData.totalFav[0].color = 'red';

      var primaryData = canvasData.baseStats.concat(canvasData.totalFav);
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

      if (firstParamData[0].type === 'line' && secondParamData[0].type === 'line') {
        firstParamData[0].color = 'red';
        secondParamData[0].color = 'white';
      } else if (firstParamData[0].type === 'line' && secondParamData[0].type !== 'line') {
        firstParamData[0].color = 'white';
      } else if (firstParamData[0].type !== 'line' && secondParamData[0].type === 'line') {
        secondParamData[0].color = 'white';
      }

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

  function convertPokemonData(data) {
    var averages = {
      attack: [],
      defense: [],
      'hit points': [],
      'special attack': [],
      'special defense': [],
      speed: [],
      favorites: []
    };
    var generations = {};
    var values = {};
    var numOfType = {};
    var genFavorites = [];

    for (var i = 1; i < data.length - 1; i += 1) {
      var row = data[i];
      var gen = row[0];

      if (!generations[gen]) {
        generations[gen] = [];
      }

      generations[gen].push(row);
    }

    for (var generation in generations) {
      if (generations.hasOwnProperty(generation)) {
        var gen = generations[generation];
        var sumAtk = sumDef = sumHP = sumSpAtk = sumSpDef = sumSpd = sumFavorites = 0;
        var primaryType;
        var genSumTypes = {};

        values[generation] = {
          attack: [],
          defense: [],
          'hit points': [],
          'special attack': [],
          'special defense': [],
          speed: []
        };

        for (var i = 0; i < gen.length; i += 1) {
          var pokemon = gen[i];

          primaryType = pokemon[3];

          if (genSumTypes[primaryType]) {
            genSumTypes[primaryType].count += 1;
            genSumTypes[primaryType].votes += parseInt(pokemon[11]);
          } else {
            genSumTypes[primaryType] = {
              count: 1,
              votes: parseInt(pokemon[11])
            };
          }

          values[generation].attack.push({ label: pokemon[1], y: parseInt(pokemon[4]) });
          values[generation].defense.push({ label: pokemon[1], y: parseInt(pokemon[5]) });
          values[generation]['hit points'].push({ label: pokemon[1], y: parseInt(pokemon[6]) });
          values[generation]['special attack'].push({ label: pokemon[1], y: parseInt(pokemon[7]) });
          values[generation]['special defense'].push({ label: pokemon[1], y: parseInt(pokemon[8]) });
          values[generation].speed.push({ label: pokemon[1], y: parseInt(pokemon[9]) });

          sumAtk += parseInt(pokemon[4]);
          sumDef += parseInt(pokemon[5]);
          sumHP += parseInt(pokemon[6]);
          sumSpAtk += parseInt(pokemon[7]);
          sumSpDef += parseInt(pokemon[8]);
          sumSpd += parseInt(pokemon[9]);
          sumFavorites += parseInt(pokemon[11]);
        }

        for (var type of pokemonTypes) {
          if (!numOfType[type]) {
            numOfType[type] = [];
          }

          if (genSumTypes[type]) {
            numOfType[type].push({
              label: generation,
              y: genSumTypes[type].count,
              v: genSumTypes[type].votes,
              p: Math.round((genSumTypes[type].count / gen.length) * 100)
            });
          } else {
            numOfType[type].push({});
          }
        }

        averages.attack.push({ label: generation, y: Math.round(sumAtk / gen.length) });
        averages.defense.push({ label: generation, y: Math.round(sumDef / gen.length) });
        averages['hit points'].push({ label: generation, y: Math.round(sumHP / gen.length) });
        averages['special attack'].push({ label: generation, y: Math.round(sumSpAtk / gen.length) });
        averages['special defense'].push({ label: generation, y: Math.round(sumSpDef / gen.length) });
        averages.speed.push({ label: generation, y: Math.round(sumSpd / gen.length) });
        averages.favorites.push({ label: generation, y: Math.round(sumFavorites / gen.length) });

        genFavorites.push({label: generation, y: sumFavorites });
      }
    }

    return { averages, values, numOfType, genFavorites };
  }

  function handlePokemonTypeClick(event) {
    showBackButton();
    var typeClicked = event.dataPoint.label;
    var drilldownChartTitle = capitalize(typeClicked);
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Base Stats for ' + drilldownChartTitle + ' Pokémon'
      },
      axisX: {
        title: 'Pokémon'
      },
      axisY: {
        title: 'Stat Values'
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      data: [
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#da4f4a',
          name: 'Attack',
          dataPoints: pokemonData.values[typeClicked].attack
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#016ecd',
          name: 'Defense',
          dataPoints: pokemonData.values[typeClicked].defense
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#5ab75c',
          name: 'Hit Points',
          dataPoints: pokemonData.values[typeClicked]['hit points']
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#faa632',
          name: 'Special Attack',
          dataPoints: pokemonData.values[typeClicked]['special attack']
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#4aafcd',
          name: 'Special Defense',
          dataPoints: pokemonData.values[typeClicked]['special defense']
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#9d29b2',
          name: 'Speed',
          dataPoints: pokemonData.values[typeClicked].speed
        }
      ]
    });
    chart.render();
  }

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