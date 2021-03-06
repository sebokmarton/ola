# Note: gcc 4.6.1 is pretty strict about library ordering. Libraries need to be
# specified in the order they are used. i.e. a library should depend on things
# to the right, not the left.
# See http://www.network-theory.co.uk/docs/gccintro/gccintro_18.html

if BUILD_EXAMPLES

# The following should match what pkg-config --libs libola returns
EXAMPLE_COMMON_LIBS = common/libolacommon.la \
                      ola/libola.la

# LIBRARIES
##################################################
noinst_LTLIBRARIES += examples/libolaconfig.la
examples_libolaconfig_la_SOURCES = \
    examples/OlaConfigurator.h \
    examples/OlaConfigurator.cpp


# PROGRAMS
##################################################
bin_PROGRAMS += \
    examples/ola_dev_info \
    examples/ola_e131 \
    examples/ola_rdm_discover \
    examples/ola_rdm_get \
    examples/ola_recorder \
    examples/ola_streaming_client \
    examples/ola_timecode \
    examples/ola_uni_stats \
    examples/ola_usbpro

if USE_ARTNET
bin_PROGRAMS += examples/ola_artnet
examples_ola_artnet_SOURCES = examples/ola-artnet.cpp
examples_ola_artnet_LDADD = examples/libolaconfig.la \
                            $(EXAMPLE_COMMON_LIBS) \
                            plugins/artnet/messages/libolaartnetconf.la \
                            $(libprotobuf_LIBS)
endif

examples_ola_dev_info_SOURCES = examples/ola-client.cpp
examples_ola_dev_info_LDADD = $(EXAMPLE_COMMON_LIBS)

examples_ola_e131_SOURCES = examples/ola-e131.cpp
examples_ola_e131_LDADD = examples/libolaconfig.la \
                          $(EXAMPLE_COMMON_LIBS) \
                          plugins/e131/messages/libolae131conf.la \
                          $(libprotobuf_LIBS)

examples_ola_streaming_client_SOURCES = examples/ola-streaming-client.cpp
examples_ola_streaming_client_LDADD = $(EXAMPLE_COMMON_LIBS)

examples_ola_usbpro_SOURCES = examples/ola-usbpro.cpp
examples_ola_usbpro_LDADD = examples/libolaconfig.la \
                            $(EXAMPLE_COMMON_LIBS) \
                            plugins/usbpro/messages/libolausbproconf.la \
                            $(libprotobuf_LIBS)

examples_ola_rdm_get_SOURCES = examples/ola-rdm.cpp
examples_ola_rdm_get_LDADD = $(EXAMPLE_COMMON_LIBS)

examples_ola_rdm_discover_SOURCES = examples/ola-rdm-discover.cpp
examples_ola_rdm_discover_LDADD = $(EXAMPLE_COMMON_LIBS)

examples_ola_recorder_SOURCES = \
    examples/ola-recorder.cpp \
    examples/ShowLoader.h \
    examples/ShowLoader.cpp \
    examples/ShowPlayer.h \
    examples/ShowPlayer.cpp \
    examples/ShowRecorder.h \
    examples/ShowRecorder.cpp \
    examples/ShowSaver.h \
    examples/ShowSaver.cpp
examples_ola_recorder_LDADD = $(EXAMPLE_COMMON_LIBS)

examples_ola_timecode_SOURCES = examples/ola-timecode.cpp
examples_ola_timecode_LDADD = $(EXAMPLE_COMMON_LIBS)

examples_ola_uni_stats_SOURCES = examples/ola-uni-stats.cpp
examples_ola_uni_stats_LDADD = $(EXAMPLE_COMMON_LIBS)

if HAVE_NCURSES
bin_PROGRAMS += examples/ola_dmxconsole examples/ola_dmxmonitor
examples_ola_dmxconsole_SOURCES = examples/ola-dmxconsole.cpp
examples_ola_dmxconsole_LDADD = $(EXAMPLE_COMMON_LIBS) -lcurses
examples_ola_dmxmonitor_SOURCES = examples/ola-dmxmonitor.cpp
examples_ola_dmxmonitor_LDADD = $(EXAMPLE_COMMON_LIBS) -lcurses
endif

noinst_PROGRAMS += examples/ola_throughput examples/ola_latency
examples_ola_throughput_SOURCES = examples/ola-throughput.cpp
examples_ola_throughput_LDADD = $(EXAMPLE_COMMON_LIBS)
examples_ola_latency_SOURCES = examples/ola-latency.cpp
examples_ola_latency_LDADD = $(EXAMPLE_COMMON_LIBS)

# Many of the example programs are just symlinks to ola_dev_info
install-exec-hook-examples:
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_patch
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_plugin_info
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_set_dmx
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_set_priority
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_uni_info
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_uni_merge
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_uni_name
	$(LN_S) -f $(bindir)/ola_dev_info $(DESTDIR)$(bindir)/ola_plugin_state
	$(LN_S) -f $(bindir)/ola_rdm_get $(DESTDIR)$(bindir)/ola_rdm_set

INSTALL_EXEC_HOOKS += install-exec-hook-examples
endif
