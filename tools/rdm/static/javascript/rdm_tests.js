/*
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Library General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 *
 * 
 * Copyright (C) 2012 Ravindra Nath Kakarla
 */

RDMTests = function() {
};

rdmtests = new RDMTests();

RDMTests.ajax_loader = "<img src='images/loader.gif' />";

RDMTests.TEST_RESULTS = new Array();

RDMTests.prototype.set_notification = function(options) {
  if (options.title != undefined || options.title != null) {
    $('#rdm-tests-notification-title').html(options.title);
  }
  if (options.message != undefined || options.message != null) {
    $('#rdm-tests-notification-message').html(options.message);
  }
  $('#rdm-tests-notification').show();
};

RDMTests.prototype.clear_notification = function() {
  $('#rdm-tests-notification-title').empty();
  $('#rdm-tests-notification-message').empty();
  $('#rdm-tests-notification').hide();
};

RDMTests.prototype.bind_events_to_doms = function() {
  $('#universe_options').change(function() {
    rdmtests.update_device_list();
  });

  $('#rdm-tests-selection-run_tests').click(function() {
    rdmtests.validate_form();
  });

  $('#rdm-tests-send_dmx_in_bg').change(function() {
    $('#rdm-tests-dmx_options').toggle('fast');
  });

  $(document).keydown(function(e) {
    var key = e.keyCode || e.which;
    var results_div = $('#rdm-tests-results');
    var test_frame = $('#tests_control_frame');

    if (results_div.css('display') == 'block' && key == 27) {
      results_div.hide();
      $('#tests_control_frame').show();
    }

    if (key == 13 && test_frame.css('display') == 'block') {
      rdmtests.validate_form();
    }
  });

  $('#rdm-tests-results-button-dismiss').click(function() {
    $('#rdm-tests-results').hide();
    $('#tests_control_frame').show();
  });

  $('#rdm-tests-results-button-run_again').click(function() {
    rdmtests.validate_form();
  });

  $.each(['#rdm-tests-results-warnings', '#rdm-tests-results-advisories'], function(i, div) {
    $(div).find('legend').toggle(function() {
      $(div).find('ul').show();
      $.each($(div).nextAll('div'), function(i, dom) {
        $(dom).css({'top': (parseFloat($(dom).css('top')) + 16).toString() + '%'});
      });
    }, function() {
      $(div).find('ul').hide();
      $.each($(div).nextAll('div'), function(i, dom) {
        $(dom).css({'top': (parseFloat($(dom).css('top')) - 16).toString() + '%'});
      });
    });
  });

  $('#rdm-tests-results-summary-filter-by_state').change(function() {
    var state = $(this).val();
    $('#rdm-tests-results-list').html('');
    if (state == 'All') {
      for (var definition in RDMTests.TEST_RESULTS) {
        var test_option = $('<option />').val(definition).text(definition);
        rdmtests.add_state_class(RDMTests.TEST_RESULTS[definition]['state'], test_option);
        $('#rdm-tests-results-list').append(test_option);
      }
    } else {
      for (var definition in RDMTests.TEST_RESULTS) {
        if (RDMTests.TEST_RESULTS[definition]['state'] == state) {
          var test_option = $('<option />').val(definition).text(definition);
          rdmtests.add_state_class(state, test_option);
          $('#rdm-tests-results-list').append(test_option);
        }
      }
    }
  });
};

RDMTests.prototype.query_server = function(request, params, callback) {
  $.ajax({
    url: request, 
    type: 'GET',
    data: params, 
    dataType: 'json',
    success: function(data) {
      if (data['status'] == true) {
        callback(data);
      } else {
        rdmtests.clear_notification();
        rdmtests.set_notification({
          'title': 'Error',
          'message': data['message']
        });
      }
    },
    cache: false
  });
};

RDMTests.prototype.update_universe_list = function() {
  this.query_server('../GetUnivInfo', {}, function(data) {
    if (data['status'] == true) {
      var universes = data.universes;
      var universe_options = $('#universe_options');
      $('#universe_options').empty();
      $.each(universes, function(item) {
        universe_options.append($('<option />').val(universes[item]._id)
                                .text(universes[item]._name));
      });
      rdmtests.update_device_list();
    }
  });
};

RDMTests.prototype.update_device_list = function() {
  var universe_options = $('#universe_options');
  var devices_list = $('#devices_list');
  this.query_server('../GetDevices', { 'u': universe_options.val() }, function(data) {
    if (data['status'] == true) {
      devices_list.empty();
      var uids = data.uids;
      $.each(uids, function(item) {
        devices_list.append($('<option />').val(uids[item])
                                .text(uids[item]));
      });
    }
  });
};

RDMTests.prototype.fetch_test_defs = function() {
  this.query_server('../GetTestDefs', {'c': 0}, function(data) {
    var tests_selector = $('#rdm-tests-selection-tests_list');
    var test_defs = data.test_defs;
    $.each(data.test_defs, function(item) {
      tests_selector.append($('<option />').val(test_defs[item])
                                           .text(test_defs[item]));
    });
    $('#rdm-tests-selection-tests_list').multiselect();
    $('#rdm-tests-selection-tests_list').multiselect({sortable: false, searchable: true});
  });
};

RDMTests.prototype.run_tests = function(test_filter) {
  this.set_notification({
                          'title': 'Running tests',
                          'message': RDMTests.ajax_loader
  });

  this.query_server('../RunTests', {
                                     'u': $('#universe_options').val(),
                                     'uid': $('#devices_list').val(),
                                     'w': $('#write_delay').val(),
                                     'f': ($('#rdm-tests-send_dmx_in_bg').attr('checked')?$('#dmx_frame_rate').val():0),
                                     'c': $('#slot_count').val(),
                                     'c': ($('#rdm-tests-send_dmx_in_bg').attr('checked')?$('#slot_count').val():128),
                                     't': test_filter.join(','),
                                    }, function(data) {
                                    var failed_tests = $('#rdm-tests-selection-failed_tests');
                                    var failed_defs = new Array();
                                    for (i in data['test_results']) {
                                      switch (data['test_results'][i]['state']) {
                                        case 'Failed':
                                          failed_defs.push(data['test_results'][i]['definition']);
                                          break;
                                      }
                                    }
                                    for (item in failed_defs) {
                                      failed_tests.append($('<option />').val(failed_defs[item]).text(failed_defs[item]));
                                    }
                                    failed_tests.multiselect();
                                    rdmtests.clear_notification();
                                    rdmtests.display_results(data);
  });
};

RDMTests.prototype.reset_results = function() {
  $.each(['#rdm-tests-results-uid',
  '#rdm-tests-results-stats-figures',
  '#rdm-tests-results-warnings-content',
  '#rdm-tests-results-advisories-content',
  '#rdm-tests-results-list'], function(i, dom) {
    $(dom).html('');
  });
  $('#rdm-tests-results-summary-filter-by_state').val('All')
};

RDMTests.prototype.add_state_class = function(state, dom) {
  $(dom).removeClass($(dom).attr('class'));
  switch (state) {
    case 'Passed':
      $(dom).addClass('test-state-passed')
      break;
    case 'Failed':
      $(dom).addClass('test-state-failed')
      break;
    case 'Broken':
      $(dom).addClass('test-state-broken')
      break;
    case 'Not Run':
      $(dom).addClass('test-state-not_run')
      break;
    }
};

RDMTests.prototype.display_results = function(results) {
  $('#tests_control_frame').hide();
  rdmtests.reset_results();

  $('#rdm-tests-results-uid').html(results['UID']);

  for (key in results['stats']) {
    $('#rdm-tests-results-stats-figures')
    .append($('<td />').html(results['stats'][key]));
  }

  var number_of_warnings = 0;
  var number_of_advisories = 0;

  for (index in results['test_results']) {
    var warnings = results['test_results'][index]['warnings'];
    var advisories = results['test_results'][index]['advisories'];
    var definition = results['test_results'][index]['definition'];
    var state = results['test_results'][index]['state'];

    //Populating a global variable with test results for faster lookups
    RDMTests.TEST_RESULTS[definition] = results['test_results'][index];

    number_of_warnings += warnings.length;
    for (var i = 0; i < warnings.length; i++) {
      $('#rdm-tests-results-warnings-content')
      .append($('<li />')
      .html(definition + ": " + warnings[i]));
    }
    number_of_advisories += advisories.length;
    for (var i = 0; i < advisories.length; i++) {
      $('#rdm-tests-results-advisories-content')
      .append($('<li />')
      .html(definition + ": " + advisories[i]));
    }
    var test_option = $('<option />').val(definition).text(definition);

    rdmtests.add_state_class(state, test_option);

    $('#rdm-tests-results-list').append(test_option);
  }
  
  //Update the Warnings and Advisories counter
  $('#rdm-tests-results-warnings').find('legend a').html('Warnings (' + number_of_warnings.toString() + ')');
  $('#rdm-tests-results-advisories').find('legend a').html('Advisories (' + number_of_advisories.toString() + ')');

  $('#rdm-tests-results-list').change(function() {
    var definition = $('#rdm-tests-results-list option:selected').text();
    var state = RDMTests.TEST_RESULTS[definition]['state'];
    $('#rdm-tests-results-info-title').html(definition);
    rdmtests.add_state_class(state, $('#rdm-tests-results-info-state').html(state))

    $('#rdm-tests-results-info-catg').html(RDMTests.TEST_RESULTS[definition]['category']);

    $('#rdm-tests-results-info-doc').html(RDMTests.TEST_RESULTS[definition]['doc']);

    var debug = RDMTests.TEST_RESULTS[definition]['debug'];
    $('#rdm-tests-results-info-debug').html(debug.join('<br />'));
  });

  $('#rdm-tests-results').show();
};

RDMTests.prototype.validate_form = function() {
  this.isNumberField = function(dom) {
    var value = $(dom).val();
    if (value === '') {
      return true;
    }
    if (isNaN(parseFloat(value)) || !isFinite(value)) {
      alert($(dom).attr('id').replace('_', ' ').toUpperCase() + ' must be a number!');
      return false;
    } else {
      return true;
    }
  };

  if ($('#devices_list option').size() < 1) {
    alert('There are no devices available in selected universe!');
    return false;
  }

  if (!(this.isNumberField($('#write_delay')) &&
        this.isNumberField($('#dmx_frame_rate')) &&
        this.isNumberField($('#slot_count')))) {
    return false;
  }

  var slot_count_val = parseFloat($('#slot_count').val());
  if (slot_count_val < 1 || slot_count_val > 512) {
    alert('Invalid number of slots (expected: [1-512])');
    return false;
  }

  var test_filter = ['all'];

  if ($('#rdm-tests-selection-subset').attr('checked')) {
    if ($('select[name="subset_test_defs"]').val() == null) {
      alert('No tests were selected!');
      return false;
    } else {
      test_filter = $('select[name="subset_test_defs"]').val();
    }
  } else if ($('#rdm-tests-selection-previously_failed').attr('checked')) {
    if ($('select[name="failed_test_defs"]').val() == null) {
      alert('Select failed tests to run again!');
      return false;
    } else {
      test_filter = $('select[name="failed_test_defs"]').val();
    }
  }
  rdmtests.run_tests(test_filter);
};

$(document).ready(function() {
  rdmtests.bind_events_to_doms();
  rdmtests.update_universe_list();
  rdmtests.fetch_test_defs();
});
