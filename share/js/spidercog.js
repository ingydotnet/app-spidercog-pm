$SpiderCog = (SpiderCog = function() {this.init()}).prototype = new Cog;

$SpiderCog.cable_map = {};
$SpiderCog.count = 0;
$SpiderCog.next_index = null;
$SpiderCog.run = false;

$SpiderCog.setup_functions.push();

$SpiderCog.main = function() {}

$SpiderCog.start = function() {
    this.run = true;
    $('div.content').html('');
    $.get('/cables/', this.bind('handle_cable_index_page'));
}

$SpiderCog.stop = function() {
    this.run = false;
}

$SpiderCog.handle_cable_index_page = function (ajax, html) {
    var self = this;
    this.next_index = null;
    var $div = $('<div></div>');
    $div.html(this.clean_html(html))
        .find("div#content")
        .find('li.last a')
        .each(function() {
            self.next_index = $(this).attr('href').replace(/.*(?=\?)/, '')
        })
        .end()
        .find("li.live")
        .each(this.bind('handle_cable_li'));
    this.get_next_cable();
}

$SpiderCog.handle_cable_li = function(li) {
    var $li = $(li);
    var $a = $li.find('h3 a');
    var data = {};
    data.From = $a.attr('href');
    if (data.From.match(/.*\/([0-9]+)\/?$/)) {
        data.cable_number = RegExp.$1;
    }
    else {
//         console.log(this.count, "Can't find cable number for: " + data.From);
        return;
    }
    data.publish_title = $a.text()
        .replace(/^US embassy cables:\s*/, '');
    data.publish_date = $li.find('span.date').text()
        .replace(/\s*:\s*$/, '');
    var trail = $li.find('div.trailtext').html();
    if (
        trail.match(/(\d?\d\/\d?\d\/?\d\d\d\d|X+)\s*(?:<br>)?\s*(.*?)\s*$/) ||
        trail.match(/()(S E C R E T.*?)\s*$/) ||
        false
    ) {
        data.cable_sent = RegExp.$1;
        data.cable_title = RegExp.$2;
    }
    else {
        $('div.content').prepend($li);
        this.run = false;
        return;
    }

    this.cable_map[data.cable_number] = data;
}

$SpiderCog.get_next_cable = function() {
    if (! this.run) return;

    var id = null;
    for (var key in this.cable_map) {
        id = key;
        break;
    }

    if (! id) {
        if (this.next_index) {
            $.get(
                '/cables' + this.next_index,
                this.bind('handle_cable_index_page')
            );
        }
        else {
            var data = {'html': $('div.content').html()};
            this.post_json('/save/html/', data);
        }
        return;
    }

    data = this.cable_map[id];
    delete(this.cable_map[id]);
    $.get('/cable/' + id, this.bind('handle_cable_page', id, data));
}

$SpiderCog.handle_cable_page = function(id, data, ajax, html) {
    var cable_text = '';
    var $tmp = $('<div></div>')
        .html(this.clean_html(html))
        .find('#article-body-blocks p')
        .each(function () {
            cable_text += $(this).html()
                .replace(/<a.*?>([^<]*)<\/a>/ig, '$1')
                .replace(/<strong.*?>([^<]*)<\/strong>/ig, '$1')
                .replace(/<em.*?>([^<]*)<\/em>/ig, '$1')
                .replace(/\n/g, ' ')
                .replace(/<br\s*\/?>/ig, '\n')
                .replace(/\n\s*\n/g, '\n')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\s*$/, '')
                .replace(/(\S)$/, '$1\n\n');
        });
    data.Body = cable_text.replace(/\s*$/, '\n');
    this.count++;
    data.count = this.count;
    $('div.content')
       .prepend(Jemplate.process('cable_preview.html.tt', data));

// Use one line or the other:
    this.post_json('/save/cable/', data, 'save_cable_complete');
//     this.get_next_cable();
}

$SpiderCog.save_cable_complete = function(ajax, xhr, textStatus) {
    if (xhr.status == 200 && this.count < 1000)
        this.get_next_cable();
}

$SpiderCog.clean_html = function(html) {
    return html.replace(/[\s\S]*?<body.*>([\s\S]*?)<\/body[\s\S]*/, '$1')
        .replace(/<script[\s\S]+?<\/script.*?>/g, '')
        .replace(/<img[\s\S]+?>(\s*<\/img.*?>)?/ig, '')
        .replace(/\r/g, '')
        .replace(/\n\s*\n/g, '\n');
}
