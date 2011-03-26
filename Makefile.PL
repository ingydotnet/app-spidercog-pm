use inc::Module::Install;

all_from 'lib/App/SpiderCog.pm';
readme_from;
manifest_skip;

requires 'Cog::App';
requires 'App::CableCog';

install_share;

WriteAll;
