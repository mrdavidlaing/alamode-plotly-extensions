# alamode-plotly-extensions

## Usage in a Mode Analytics report

Example report: [https://app.mode.com/mrdavidlaing/reports/0c4364284744](https://app.mode.com/mrdavidlaing/reports/0c4364284744) 

![image](https://user-images.githubusercontent.com/227505/111341377-5f1b8e80-8671-11eb-9729-c0314a82e63f.png)

1.  Add a named `<div>` element in the report location you want the chart to appear in, eg: 
```html
<div class="row">
    <div class="col-md-12">
      <div id="my_example_spc_chart">
        <!-- Chart will be drawn inside this DIV -->
      </div>
    </div>
</div>
```

2.  Embed references to Plotly, the alamode-plotly-extension that you want to use and a script blog with arguments:
```html
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://mrdavidlaing.github.io/alamode-plotly-extensions/spc_chart.js"></script>
<script>
  spcChart.plot({
    'div_name': 'my_example_spc_chart',
    'chart_title': 'My SPC Chart',
    'query_name': 'mode query name',
    'timestamp_colname': 'name_of_timestamp_column_in_mode_query',
    'values_colname': 'name_of_values_column_in_mode_query',
    'process_1_start_date': new Date('2021-01-20'),                  // The data to start computing process mean & limits (allows excluding initial "noisy" data)
    'y_axis_range': [0, 130]                                         // Choose some sensible limits
  });
</script>
```
