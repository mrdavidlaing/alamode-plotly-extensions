const spcChart = {

    reportError: function (msg) {
        $("<h1 class='mode-error'>").text(msg).prependTo(document.body);
    },

    getColumnsFromQuery: function (queryName) {
        var columns = datasets.filter(function (d) {
            if (d) {
                return d.queryName == queryName;
            }
            ;
        })[0];
        if (!columns) {
            spcChart.reportError("No such query: '" + queryName + "'");
            return [];
        }
        return columns.columns
    },

    getDataFromQuery: function (queryName) {
        var data = datasets.filter(function (d) {
            if (d) {
                return d.queryName == queryName;
            }
            ;
        })[0];
        if (!data) {
            spcChart.reportError("No such query: '" + queryName + "'");
            return [];
        }
        return data.content;
    },

    plot: function (o) {
        var divName = o["div_name"],
            chart_title = o['chart_title'],
            query_name = o['query_name'],
            timestamp_colname = o['timestamp_colname'],
            values_colname = o['values_colname'],
            process_1_start_date = o['process_1_start_date'],
            y_axis_range = o['y_axis_range']

        var year_month_day_formatter = d3.time.format('%Y-%m-%d'),
            to_timestamp = (ts) => year_month_day_formatter(new Date(ts));
        var query_data = spcChart.getDataFromQuery(query_name).sort((a, b) => d3.ascending(a[timestamp_colname], b[timestamp_colname]));
        var values = query_data.map((d) => d[values_colname]);
        var timestamps = query_data.map((d) => to_timestamp(d[timestamp_colname]));
        var timestamp_min = d3.min(timestamps);
        var timestamp_max = d3.max(timestamps);

        var values_points = {
            type: 'scatter',
            x: timestamps,
            y: values,
            mode: 'markers',
            name: values_colname,
            showlegend: true,
            hoverinfo: 'all',
            marker: {
                color: 'blue',
                size: 8,
                symbol: 'circle'
            }
        }

        var values_daily_nested = d3.nest()
            .key(function (d) {
                return to_timestamp(d[timestamp_colname]);
            })
            .sortKeys(d3.ascending)
            .rollup(function (leaves) {
                return {
                    mean: d3.mean(leaves, function (d) {
                        return d[values_colname]
                    })
                };
            })
            .entries(query_data);

        var values_daily = {
            timestamps: values_daily_nested.map((d) => d.key),
            means: values_daily_nested.map((d) => d.values.mean)
        }

        var values_daily_line = {
            type: 'scatter',
            x: values_daily.timestamps,
            y: values_daily.means,
            mode: 'lines+markers',
            name: 'MEAN(' + values_colname + ')',
            showlegend: true,
            hoverinfo: 'all',
            line: {
                color: 'blue',
                width: 2
            },
            marker: {
                color: 'blue',
                size: 12,
                symbol: 'diamond-open-dot'
            }
        }

        var process_1_values = [];
        values_daily.timestamps.forEach(function (ts, i) {
            if (year_month_day_formatter.parse(ts) >= process_1_start_date) {
                process_1_values.push(values_daily.means[i])
            }
        });
        var process_1_values_mean = d3.mean(process_1_values);
        var y_values_summary_moving_range = d3.pairs(process_1_values).map(x => Math.abs(x[1] - x[0]));
        var y_values_summary_moving_range_average = d3.mean(y_values_summary_moving_range);
        var upper_process_limit = process_1_values_mean + 2.66 * y_values_summary_moving_range_average;
        var lower_process_limit = process_1_values_mean - 2.66 * y_values_summary_moving_range_average;

        var process_limit_lines = {
            type: 'scatter',
            x: [process_1_start_date, timestamp_max, null, process_1_start_date, timestamp_max],
            y: [lower_process_limit, lower_process_limit, null, upper_process_limit, upper_process_limit],
            mode: 'lines',
            name: 'LPL/UPL',
            showlegend: true,
            line: {
                color: 'red',
                width: 2,
                dash: 'dash'
            }
        }

        var process_mean_line = {
            type: 'scatter',
            x: [process_1_start_date, timestamp_max],
            y: [process_1_values_mean, process_1_values_mean],
            mode: 'lines',
            name: 'Process mean',
            showlegend: true,
            line: {
                color: 'grey',
                width: 2
            }
        }

        var values_histogram = {
            type: 'histogram',
            x: timestamps,
            y: values,
            name: 'Distribution',
            orientation: 'h',
            marker: {
                color: 'blue',
                line: {
                    color: 'white',
                    width: 1
                }
            },
            xaxis: 'x2',
            yaxis: 'y2'
        }

        var violation_points = {
            type: 'scatter',
            x: [timestamps[5]],
            y: [values[5]],
            mode: 'markers',
            name: 'Violation',
            showlegend: true,
            marker: {
                color: 'rgb(255,65,54)',
                line: {
                    width: 3
                },
                opacity: 0.5,
                size: 12,
                symbol: 'circle-open'
            }
        }

        var chart_data = [process_limit_lines, process_mean_line, values_points, values_daily_line, values_histogram] // ,violation_points]

        // layout
        var layout = {
            title: chart_title,
            xaxis: {
                domain: [0, 0.88], //left portion
            },
            yaxis: {
                range: y_axis_range
            },
            xaxis2: {
                domain: [0.92, 1] //right portion
            },
            yaxis2: {
                anchor: 'x2',
                range: y_axis_range,
                showticklabels: false
            }
        }

        Plotly.newPlot(divName, chart_data, layout);
    }
};