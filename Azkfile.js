systems({
  koel: {
    depends: ['mysql'],
    image: {'docker': 'azukiapp/php-fpm:5.6'},
    provision: [
      'npm install',
      'composer install --no-interaction --prefer-source',
      'php artisan init',
    ],
    command: 'php artisan serve',
    workdir: '/azk/#{manifest.dir}',
    shell: '/bin/bash',
    wait: 40,
    mounts: {
      '/azk/#{manifest.dir}': sync('.'),
      '/azk/#{manifest.dir}/vendor': persistent('./vendor'),
      '/azk/#{manifest.dir}/composer.phar': persistent('./composer.phar'),
      '/azk/#{manifest.dir}/composer.lock': path('./composer.lock'),
      '/azk/#{manifest.dir}/.env.php': path('./.env.php'),
      '/azk/#{manifest.dir}/bootstrap/compiled.php': path('./bootstrap/compiled.php'),
      '/azk/#{manifest.dir}/node_modules': persistent('./node_modules'),
    },
    scalable: {'default': 1},
    http: {
      domains: [ '#{system.name}.#{azk.default_domain}' ]
    },
    ports: {
      // exports global variables
      http: '8000/tcp',
    },
    envs: {
      ADMIN_EMAIL: 'admin',
      ADMIN_NAME: 'admin',
      ADMIN_PASSWORD: 'admin',
      APP_MAX_SCAN_TIME: 600,
      APP_DIR: '/azk/#{manifest.dir}',
    },
  },

  mysql: {
    image: {'docker': 'azukiapp/mysql:5.7'},
    scalable: { default: 1, limit: 1 },
    mounts: {
      '/var/lib/mysql': persistent('mysql_lib#{system.name}'),
    },
    shell: '/bin/bash',
    ports: {
      data: '3306:3306/tcp',
    },
    wait: {'retry': 25, 'timeout': 1000},
    envs: {
      MYSQL_USER         : 'azk',
      MYSQL_PASS         : 'azk',
      MYSQL_PASSWORD     : 'azk',
      MYSQL_ROOT_PASSWORD: 'azk',
      MYSQL_DATABASE     : '#{system.name}_development', //'test',
    },
    export_envs: {
      MYSQL_DATABASE: '#{envs.MYSQL_DATABASE}',
      DB_DATABASE   : '#{envs.MYSQL_DATABASE}',

      DB_HOST       : '#{net.host}', //:#{net.port.data}
      MYSQL_HOST    : '#{net.host}',

      DB_USERNAME   : '#{envs.MYSQL_USER}',
      MYSQL_USER    : '#{envs.MYSQL_USER}',

      DB_PASSWORD   : '#{envs.MYSQL_PASS}',
      MYSQL_PASSWORD: '#{envs.MYSQL_PASSWORD}',

      DB_PORT       : '#{net.port.data}',
      MYSQL_PORT    : '#{net.port.data}',

      // DATABASE_URL: 'mysql2://#{envs.MYSQL_USER}:#{envs.MYSQL_PASS}@#{net.host}:#{net.port.data}/${envs.MYSQL_DATABASE}',
    },
  },

  // redis: {
  //   image: {'docker': 'redis'},
  //   ports: {
  //     data: '6379/tcp'
  //   },
  //   export_envs: {
  //     'REDIS_HOST': '#{net.host}',
  //     'REDIS_PORT': '#{net.port.data}',
  //     'REDIS_URL': 'redis://#{net.host}:#{net.port.data}',
  //     'OPENREDIS_URL': 'redis://#{net.host}:#{net.port.data}',
  //     'DISCOURSE_REDIS_HOST': '#{net.host}',
  //     'DISCOURSE_REDIS_PORT': '#{net.port.data}'
  //   }
  // },

});
