$(document).ready(function () {
  var myChart = $('#myChart');
  var introMessage = $('#intro-message');
  var backButton = $('#back-button');
  var datasetSelect = $('#dataset-select');
  var chart;
  var pokemonData;
  var tedOverviewData;
  var rawTedData;

  backButton.on('click', function() {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    var selectedDataset = datasetSelect.val();
    if (selectedDataset === 'pokemon') {
      plotPokemonData(pokemonData);
    } else if (selectedDataset === 'ted') {
      plotTedData(tedOverviewData);
    }
  });

  datasetSelect.on('change', function () {
    if (chart) {
      chart.destroy();
      chart = null;
    }
    var selectedDataset = datasetSelect.val();
    switch (selectedDataset) {
      case 'countries':
        hideBackButton();
        var dataPromise = readDataset('population-densities-of-the-world.csv');
        dataPromise.then(function (data) {
          var parsedData = parseData(data);
          var convertedData = convertCountryData(parsedData);
          plotCountryData(convertedData);
        })
        break;
      case 'pokemon':
        var dataPromise = readDataset('pokemon.csv');
        dataPromise.then(function (data) {
          var parsedData = parseData(data);
          pokemonData = convertPokemonData(parsedData);
          plotPokemonData(pokemonData);
        });
        break;
      case 'ted':
        hideBackButton();
        var dataPromise = readDataset('ted.csv');
        dataPromise.then(function (data) {
          rawTedData = parseData(data);
          tedOverviewData = convertTedData(rawTedData);
          plotTedData(tedOverviewData);
        });
        break;
      default:
        swal({
          type: 'question',
          title: 'Unknown Dataset!'
        });
    };
  });

  /********** HELPER FUNCTION  **********/
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

  function convertCountryData(data) {
    var convertedData = [];
    for (var i = 1; i < data.length - 1; i += 1) {
      var row = data[i];
      var newRow = {};
      var literacy = parseInt(row[4]);

      newRow.name = row[0];
      newRow.x = parseInt(row[2]);
      newRow.y = parseInt(row[1]);
      newRow.z = parseInt(row[3]);
      newRow.l = parseInt(literacy);
      newRow.markerColor = "rgba(103, 59, 184, " + (parseInt(literacy) / 100) + ")"

      convertedData.push(newRow);
    }
    return convertedData;
  }

  function plotCountryData(data) {
    introMessage.hide();
    myChart.show();
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Population Density and Literacy vs. Area and Population of Countries'
      },
      axisX: {
        title: 'Area (square miles)'
      },
      axisY: {
        title: 'Population'
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      data: [{
        type: 'bubble',
        showInLegend: true,
        legendText: "Size of Bubble Represents Population Density, Opacity Represents Literacy",
        legendMarkerType: "circle",
        legendMarkerColor: "rgba(74,172,197,0.5)",
        toolTipContent: '<b>{name}</b><br/>Population: {x}<br/>Area (sq. mi.): {y}<br/>Population Density (per sq. mi.): {z}<br />Literacy: {l}%',
        dataPoints: data
      }]
    });
    chart.render();
  }

  function convertPokemonData(data) {
    var averages = {
      attack: [],
      defense: [],
      hp: [],
      specialAttack: [],
      specialDefense: [],
      speed: []
    };
    var typeGroups = {};
    var values = {};

    for (var i = 1; i < data.length - 1; i += 1) {
      var row = data[i];
      var type = row[2];

      if (typeGroups[type]) {
        typeGroups[type].push(row);
      } else {
        typeGroups[type] = [];
        typeGroups[type].push(row);
      }
    }

    for (var type in typeGroups) {
      if (typeGroups.hasOwnProperty(type)) {
        var typeGroup = typeGroups[type];
        var sumAtk = sumDef = sumHP = sumSpAtk = sumSpDef = sumSpd = 0;

        values[type] = {
          attack: [],
          defense: [],
          hp: [],
          specialAttack: [],
          specialDefense: [],
          speed: []
        };

        for (var i = 0; i < typeGroup.length; i += 1) {
          var pokemon = typeGroup[i];

          values[type].attack.push({ label: pokemon[0], y: parseInt(pokemon[3]) });
          values[type].defense.push({ label: pokemon[0], y: parseInt(pokemon[4]) });
          values[type].hp.push({ label: pokemon[0], y: parseInt(pokemon[5]) });
          values[type].specialAttack.push({ label: pokemon[0], y: parseInt(pokemon[6]) });
          values[type].specialDefense.push({ label: pokemon[0], y: parseInt(pokemon[7]) });
          values[type].speed.push({ label: pokemon[0], y: parseInt(pokemon[8]) });

          sumAtk += parseInt(pokemon[3]);
          sumDef += parseInt(pokemon[4]);
          sumHP += parseInt(pokemon[5]);
          sumSpAtk += parseInt(pokemon[6]);
          sumSpDef += parseInt(pokemon[7]);
          sumSpd += parseInt(pokemon[8]);
        }

        averages.attack.push({label: type, y: Math.round(sumAtk / typeGroup.length)});
        averages.defense.push({label: type, y: Math.round(sumDef / typeGroup.length)});
        averages.hp.push({label: type, y: Math.round(sumHP / typeGroup.length)});
        averages.specialAttack.push({label: type, y: Math.round(sumSpAtk / typeGroup.length)});
        averages.specialDefense.push({label: type, y: Math.round(sumSpDef / typeGroup.length)});
        averages.speed.push({label: type, y: Math.round(sumSpd / typeGroup.length)});
      }
    }
    return { averages, values };
  }

  function handlePokemonTypeClick(event) {
    showBackButton();
    var typeClicked = event.dataPoint.label;
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Base Stats for ' + typeClicked + ' Pokémon'
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
          dataPoints: pokemonData.values[typeClicked].hp
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#faa632',
          name: 'Special Attack',
          dataPoints: pokemonData.values[typeClicked].specialAttack
        },
        {
          type: 'stackedColumn',
          showInLegend: true,
          color: '#4aafcd',
          name: 'Special Defense',
          dataPoints: pokemonData.values[typeClicked].specialDefense
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

  function plotPokemonData(data) {
    hideBackButton();
    introMessage.hide();
    myChart.show();
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Average Base Stats of Pokémon by Type'
      },
      axisX: {
        title: 'Primary Type of Pokémon'
      },
      axisY: {
        title: 'Stat Values'
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      data: [
        {
          click: handlePokemonTypeClick,
          type: 'stackedColumn',
          showInLegend: true,
          color: '#da4f4a',
          name: 'Attack',
          dataPoints: data.averages.attack
        },
        {
          click: handlePokemonTypeClick,
          type: 'stackedColumn',
          showInLegend: true,
          color: '#016ecd',
          name: 'Defense',
          dataPoints: data.averages.defense
        },
        {
          click: handlePokemonTypeClick,
          type: 'stackedColumn',
          showInLegend: true,
          color: '#5ab75c',
          name: 'Hit Points',
          dataPoints: data.averages.hp
        },
        {
          click: handlePokemonTypeClick,
          type: 'stackedColumn',
          showInLegend: true,
          color: '#faa632',
          name: 'Special Attack',
          dataPoints: data.averages.specialAttack
        },
        {
          click: handlePokemonTypeClick,
          type: 'stackedColumn',
          showInLegend: true,
          color: '#4aafcd',
          name: 'Special Defense',
          dataPoints: data.averages.specialDefense
        },
        {
          click: handlePokemonTypeClick,
          type: 'stackedColumn',
          showInLegend: true,
          color: '#9d29b2',
          name: 'Speed',
          dataPoints: data.averages.speed
        }
      ]
    });
    chart.render();
  }

  function convertTedData(data) {
    var sumTags = {};
    var sumViewsOfTags = {};
    var tagsData = [];
    var viewsOfTagsData = [];

    for (var i = 1; i < data.length - 1; i += 1) {
      var row = data[i];
       // convert string representation of array to JS array
      // var ratings = JSON.parse(row[2].replace(/'/g, '"'));
      var tags = JSON.parse(row[3].replace(/'/g, '"'));

      for (var k = 0; k < tags.length; k += 1) {
        if (sumTags[tags[k]]) {
          sumTags[tags[k]] += 1;
        } else {
          sumTags[tags[k]] = 1;
        }
        if (sumViewsOfTags[tags[k]]) {
          sumViewsOfTags[tags[k]] += parseInt(row[5]);
        } else {
          sumViewsOfTags[tags[k]] = parseInt(row[5]);
        }
      }
    }

    for (var tag in sumTags) {
      tagsData.push({
        label: tag,
        y: sumTags[tag]
      });
    }
 
    for (var tag in sumViewsOfTags) {
      viewsOfTagsData.push({
        label: tag,
        y: sumViewsOfTags[tag]
      })
    }

    return { tagsData, viewsOfTagsData };
  }

  function plotTedData(data) {
    hideBackButton();
    introMessage.hide();
    myChart.show();
    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'TED Talk Viewership by Tag'
      },
      axisX: {
        title: 'TED Talk Tags'
      },
      axisY: {
        title: 'Number of TED Talks'
      },
      axisY2: {
        title: 'Number of Views'
      },
      toolTip: {
        fontFamily: 'Roboto',
        shared: true
      },
      data: [
        {
          type: 'column',
          click: handleTedTagClick,
          toolTipContent: '<b>{label}</b><br/>Tagged TED Talks: {y}',
          dataPoints: data.tagsData
        },
        {
          type: 'area',
          click: handleTedTagClick,
          axisYType: "secondary",
          toolTipContent: 'Total Views of Tagged TED Talks: {y}',
          dataPoints: data.viewsOfTagsData
        }
      ]
    });
    chart.render();
  }

  function handleTedTagClick(event) {
    showBackButton();
    var tagClicked = event.dataPoint.label;
    var plotData = {};
    var viewsData = [];
    var canvasData = [];

    for (var i = 1; i < rawTedData.length - 1; i += 1) {
      var row = rawTedData[i];
      var tags = JSON.parse(row[3].replace(/'/g, '"'));

      if (tags.includes(tagClicked)) {
        var ratings = JSON.parse(row[2].replace(/'/g, '"'));

        for (var j = 0; j < ratings.length; j += 1) {
          var rating = ratings[j].name;
          if (plotData[rating]) {
            plotData[rating].push({
              e: row[0],
              s: row[1],
              name: row[4],
              y: ratings[j].count
            });
          } else {
            plotData[rating] = [];
            plotData[rating].push({
              e: row[0],
              s: row[1],
              name: row[4],
              y: ratings[j].count
            });
          }
        }

        viewsData.push({ y: parseInt(row[5]) });
      }
    }

    for (var plotPoint in plotData) {
      var stack = {
        type: 'stackedColumn',
        showInLegend: true,
        name: plotPoint,
        toolTipContent: '<b>{name}</b><br/>Event: {e}<br/>Speaker: {s}<br/>' + plotPoint + ': {y}',
        dataPoints: plotData[plotPoint]
      };
      canvasData.push(stack);
    }

    canvasData.push({
      type: 'line',
      axisYType: "secondary",
      color: "black",
      toolTipContent: '<b>Views</b>: {y}',
      dataPoints: viewsData
    });

    chart = new CanvasJS.Chart('myChart', {
      animationEnabled: true,
      zoomEnabled: true,
      theme: 'light2',
      title: {
        text: 'Ratings for ' + tagClicked + ' TED Talks'
      },
      axisX: {
        title: 'TED Talks',
        interval: 1,
        labelFontSize: 1
      },
      axisY: {
        title: 'Ratings'
      },
      axisY2: {
        title: 'Number of Views'
      },
      toolTip: {
        fontFamily: 'Roboto'
      },
      data: canvasData
    });
    chart.render();
  }
});