use inc::Module::Install;

all_from 'lib/App/SpiderCog.pm';
readme_from;
manifest_skip;

requires 'Cog::App';

install_share;

WriteAll;
